import { Platform, StyleSheet } from "react-native";
import { showMessage } from "react-native-flash-message";
import { height } from "../../assets/string";

export function ShowErrorMessage(data: string) {
	showMessage({
		type: 'danger',
		icon: 'danger',
		message: data || 'Something went wrong',
		duration: 1500,
	});
}

export function ShowInfoMessage(data: string) {
	showMessage({
		type: 'info',
		icon: 'info',
		message: data,
		duration: 1500,
	});
}

export function ShowSuccessMessage(data: string) {
	showMessage({
		type: 'success',
		icon: 'success',
		message: data,
	});
}
