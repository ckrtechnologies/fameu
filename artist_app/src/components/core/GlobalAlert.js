import React, { useState, forwardRef, useImperativeHandle } from 'react';
import CustomAlert from './CustomAlert';
import { formatEducatedError } from '../../utils/educatedError';

export const GlobalAlertRef = React.createRef();

export const GlobalAlert = {
  show: (title, message, buttons, options = {}) => {
    GlobalAlertRef.current?.show(title, message, buttons, options);
  },
  showError: (title, error, contextMessage = 'Your request could not be completed.', buttons = []) => {
    const educated = formatEducatedError(error, contextMessage);
    GlobalAlertRef.current?.show(
      title || 'Something went wrong',
      educated.message,
      buttons,
      {
        type: 'error',
        reason: educated.reason,
        guidance: educated.guidance,
      }
    );
  },
  showSuccess: (title, message, buttons = []) => {
    GlobalAlertRef.current?.show(title, message, buttons, { type: 'success' });
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
    type: 'info',
    reason: null,
    guidance: null,
  });

  useImperativeHandle(ref, () => ({
    show: (title, message, buttons, options = {}) => {
      setAlertConfig({
        title,
        message,
        buttons: buttons || [],
        type: options.type || (title?.toLowerCase().includes('error') ? 'error' : 'info'),
        reason: options.reason || null,
        guidance: options.guidance || null,
      });
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
      type={alertConfig.type}
      reason={alertConfig.reason}
      guidance={alertConfig.guidance}
      onClose={handleClose}
    />
  );
});

export default GlobalAlertProvider;
