import React, { useState, forwardRef, useImperativeHandle } from 'react';
import CustomAlert from './CustomAlert';

export const GlobalAlertRef = React.createRef();

export const GlobalAlert = {
  show: (title, message, buttons) => {
    GlobalAlertRef.current?.show(title, message, buttons);
  },
  hide: () => {
    GlobalAlertRef.current?.hide();
  },
};

const GlobalAlertProvider = forwardRef((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: '',
    message: '',
    buttons: [],
  });

  useImperativeHandle(ref, () => ({
    show: (title, message, buttons) => {
      setAlertConfig({ title, message, buttons });
      setVisible(true);
    },
    hide: () => {
      setVisible(false);
    },
  }));

  const handleClose = () => {
    setVisible(false);
  };

  return (
    <CustomAlert
      visible={visible}
      title={alertConfig.title}
      message={alertConfig.message}
      buttons={alertConfig.buttons}
      onClose={handleClose}
    />
  );
});

export default GlobalAlertProvider;