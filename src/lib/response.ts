export const success = ({ data, message }: { data: any; message: string }) =>
	new Response(JSON.stringify({ data, message, success: true }), { status: 200 });

export const error = ({ message, status = 400 }: { message: string; status?: number }) =>
	new Response(JSON.stringify({ message, success: false }), { status });
