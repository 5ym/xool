export default function Toast({ message }: { message?: string }) {
	if (!message) {
		return;
	}

	return (
		<div className="toast z-50">
			<div className="alert alert-info">
				<span>{message}</span>
			</div>
		</div>
	);
}
