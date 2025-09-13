import { motion } from 'framer-motion';

const InfoCard = ({ title, icon: Icon, children, gradient = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-xl shadow-lg overflow-hidden h-full ${
        gradient ? 'card-gradient' : 'card'
      }`}
    >
      <div className="flex items-center mb-4">
        {Icon && <Icon className="w-5 h-5 mr-2" />}
        <h3 className="text-lg font-medium">{title}</h3>
      </div>
      <div>{children}</div>
    </motion.div>
  );
};

export default InfoCard;
