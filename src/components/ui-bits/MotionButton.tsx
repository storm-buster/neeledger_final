import React from 'react';
import { motion } from 'framer-motion';
import { Button, type ButtonProps } from './Button';

export const MotionButton = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
  return (
    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.985 }} transition={{ type: 'spring', stiffness: 300 }}>
      <Button ref={ref} {...props} />
    </motion.div>
  );
});

MotionButton.displayName = 'MotionButton';

export default MotionButton;
