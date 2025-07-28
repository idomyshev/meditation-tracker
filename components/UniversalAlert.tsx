import { Alert, Platform } from 'react-native';

interface AlertButton {
    text: string;
    style?: 'default' | 'cancel' | 'destructive';
    onPress?: () => void;
}

interface UniversalAlertOptions {
    title: string;
    message?: string;
    buttons: AlertButton[];
}

export const showUniversalAlert = (options: UniversalAlertOptions) => {
    if (Platform.OS === 'web') {
        // Для веб-версии используем confirm/alert
        const { title, message, buttons } = options;

        if (buttons.length === 1) {
            // Простой alert
            alert(`${title}\n${message || ''}`);
            buttons[0].onPress?.();
        } else if (buttons.length === 2) {
            // Confirm с двумя кнопками
            const isConfirmed = window.confirm(`${title}\n${message || ''}`);
            if (isConfirmed) {
                // Находим кнопку "подтвердить" (не cancel)
                const confirmButton = buttons.find(btn => btn.style !== 'cancel');
                confirmButton?.onPress?.();
            } else {
                // Находим кнопку "отмена"
                const cancelButton = buttons.find(btn => btn.style === 'cancel');
                cancelButton?.onPress?.();
            }
        } else {
            // Для более сложных случаев используем простой confirm
            const isConfirmed = window.confirm(`${title}\n${message || ''}`);
            if (isConfirmed) {
                buttons[0].onPress?.();
            }
        }
    } else {
        // Для нативных платформ используем Alert
        Alert.alert(options.title, options.message, options.buttons);
    }
};

// Удобные функции для часто используемых алертов
export const showConfirmAlert = (
    title: string,
    message: string,
    onConfirm: () => void,
    onCancel?: () => void
) => {
    showUniversalAlert({
        title,
        message,
        buttons: [
            { text: 'Отмена', style: 'cancel', onPress: onCancel },
            { text: 'Подтвердить', style: 'destructive', onPress: onConfirm }
        ]
    });
};

export const showInfoAlert = (
    title: string,
    message: string,
    onOk?: () => void
) => {
    showUniversalAlert({
        title,
        message,
        buttons: [{ text: 'OK', onPress: onOk }]
    });
}; 