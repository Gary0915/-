#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Adafruit_BMP280.h>

// —— Wi-Fi 配置 —— 
const char* ssid     = "Beaulo";
const char* password = "Beaulo28";

// —— Cloudflare Worker KV 写入接口 —— 
const char* serverURL = "https://5e62623b.solar-dashboard-withapi.pages.dev/api/write";

// —— 传感器及管脚定义 —— 
#define DHT_PIN     4        // DHT11 数据线接到 GPIO 4
#define DHT_TYPE    DHT11
DHT dht(DHT_PIN, DHT_TYPE);

// BMP280 使用 I2C 总线
#define BMP_SDA_PIN 21       // SDA 连接到 GPIO 21
#define BMP_SCL_PIN 22       // SCL 连接到 GPIO 22
Adafruit_BMP280 bmp;

// —— 发送 KV 数据的间隔 (毫秒) —— 
#define SEND_INTERVAL  5000

// —— 全局变量，存储传感数据 —— 
float temperatureValue = 0;  // 摄氏度
float humidityValue    = 0;  // 百分比
float pressureValue    = 0;  // hPa
float altitudeValue    = 0;  // 米

unsigned long lastSendTime = 0;  // 记录上次发送的时间戳

// —— Setup 部分，只执行一次 —— 
void setup() {
  Serial.begin(115200);
  delay(100);
  Serial.println("\n=== ESP32 传感器读取 + KV 写入 示例 ===");

  // 1. 连接 Wi-Fi
  Serial.printf("连接到 Wi-Fi：%s\n", ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("··· 等待 Wi-Fi 连接中 ...");
  }
  Serial.println("Wi-Fi 已连接！");
  Serial.printf("ESP32 本地 IP: %s\n", WiFi.localIP().toString().c_str());

  // 2. 初始化 DHT11
  dht.begin();
  Serial.println("DHT11 初始化完成");

  // 3. 初始化 BMP280 (I2C)
  Wire.begin(BMP_SDA_PIN, BMP_SCL_PIN);
  if (!bmp.begin(0x76)) {
    Serial.println("BMP280 初始化失败，请检查接线！");
  } else {
    Serial.println("BMP280 初始化成功");
    bmp.setSampling(Adafruit_BMP280::MODE_NORMAL,
                    Adafruit_BMP280::SAMPLING_X2,
                    Adafruit_BMP280::SAMPLING_X16,
                    Adafruit_BMP280::FILTER_X16,
                    Adafruit_BMP280::STANDBY_MS_500);
  }

  // 4. 初始化定时
  lastSendTime = millis();
}

// —— Loop 部分，会不断循环执行 —— 
void loop() {
  unsigned long now = millis();

  // —— 步骤1：每 2 秒读取一次 DHT11 与 BMP280 传感器 —— 
  static unsigned long lastSensorRead = 0;
  if (now - lastSensorRead >= 2000) {
    lastSensorRead = now;
    readSensors();
  }

  // —— 步骤2：每 5 秒（SEND_INTERVAL）将数据写入 KV —— 
  if (now - lastSendTime >= SEND_INTERVAL) {
    lastSendTime = now;
    sendDataToKV();
  }
}

// —— 从 DHT11 + BMP280 读取数据 —— 
void readSensors() {
  // 读取 DHT11
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  if (!isnan(h)) {
    humidityValue = h;
  } else {
    humidityValue = 0.0;
  }
  if (!isnan(t)) {
    temperatureValue = t;
  } else {
    temperatureValue = 0.0;
  }

  // 读取 BMP280：读取气压 (Pa)，然后转 hPa
  if (bmp.begin(0x76)) {
    float p = bmp.readPressure();          // 单位：Pa
    pressureValue = p / 100.0;              // 转为 hPa
    altitudeValue = bmp.readAltitude(1013.25); // 以 1013.25 hPa 作为海平面标准气压来估算海拔
  }

  Serial.printf(
    "传感器读数 → 温度: %.1f °C  湿度: %.1f %%  气压: %.1f hPa  海拔: %.1f m\n",
    temperatureValue,
    humidityValue,
    pressureValue,
    altitudeValue
  );
}

// —— 构造 JSON 并通过 HTTP POST 写入 KV —— 
void sendDataToKV() {
  // 1. 获取当前“秒级”时间戳
  unsigned long ts = millis() / 1000UL;

  // 2. 构造“原始值”部分：
  //    {"pressure":1002.3,"altitude":30.0,"timestamp":1748823996,"humidity":62.0,"temperature":30.0}
  String rawDataJson = "{";
  rawDataJson += "\"pressure\":"    + String(pressureValue,    1) + ",";
  rawDataJson += "\"altitude\":"    + String(altitudeValue,    1) + ",";
  rawDataJson += "\"timestamp\":"   + String(ts)                   + ",";
  rawDataJson += "\"humidity\":"    + String(humidityValue,    1) + ",";
  rawDataJson += "\"temperature\":" + String(temperatureValue, 1);
  rawDataJson += "}";

  // 3. 将其嵌套到 { "key":"sensor1", "value": rawDataJson } 下
  String wrapped = "{";
  wrapped += "\"key\":\"sensor1\",";
  wrapped += "\"value\":" + rawDataJson;
  wrapped += "}";

  Serial.print("POST 内容 → ");
  Serial.println(wrapped);

  // 4. 使用 HTTPClient 发起 POST
  HTTPClient http;
  http.begin(serverURL);
  http.addHeader("Content-Type", "application/json");
  int code = http.POST(wrapped);

  Serial.print("HTTP 响应码: ");
  Serial.println(code);
  if (code > 0) {
    String resp = http.getString();
    Serial.print("Response Body: ");
    Serial.println(resp);
  } else {
    Serial.printf("HTTP 请求失败，错误码：%d\n", code);
  }
  http.end();
}
