import { message } from 'antd';

// Configure message defaults
message.config({
  top: 24,
  duration: 3,
  maxCount: 3,
  rtl: false,
  prefixCls: 'ant-message',
});

type ToastType = 'success' | 'error' | 'info' | 'warning' | 'loading';

interface ToastProps {
  type: ToastType;
  content: string;
  duration?: number;
  onClose?: () => void;
}

const Toast = ({ type, content, duration = 3, onClose }: ToastProps) => {
  message[type]({
    content,
    duration,
    onClose,
    className: 'custom-toast',
    style: {
      marginTop: '24px',
    },
  });
  
  return null;
};

export default Toast;

// Helper functions for different toast types
export const showToast = (type: ToastType, content: string, duration: number = 3) => {
  message[type]({
    content,
    duration,
    className: 'custom-toast',
    style: {
      marginTop: '24px',
    },
  });
};

export const showSuccessToast = (content: string, duration?: number) => {
  showToast('success', content, duration);
};

export const showErrorToast = (content: string, duration?: number) => {
  showToast('error', content, duration);
};

export const showInfoToast = (content: string, duration?: number) => {
  showToast('info', content, duration);
};

export const showWarningToast = (content: string, duration?: number) => {
  showToast('warning', content, duration);
};

export const showLoadingToast = (content: string, duration?: number) => {
  showToast('loading', content, duration);
};
