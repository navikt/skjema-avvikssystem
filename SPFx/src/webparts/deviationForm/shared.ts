import { MessageBarType } from '@fluentui/react';

export const getMessageType = (type: string): MessageBarType => {
    switch (type) {
        case 'info':
            return MessageBarType.info;
        case 'error':
            return MessageBarType.error;
        case 'severeWarning':
            return MessageBarType.severeWarning;
        case 'success':
            return MessageBarType.success;
        case 'warning':
            return MessageBarType.warning;
        default:
            return MessageBarType.info;
    }
};