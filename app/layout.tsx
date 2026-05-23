export const metadata = {
	title: 'Kung Fu Mandarin — MVP',
	description: 'MVP real (HSK1 only) no universo Kung Fu / Dojo',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="pt-BR">
			<body
				style=
					margin: 0,
					fontFamily:
						"system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
					background: '#071218',
					color: 'rgba(255,255,255,0.92)',
				
			>
				{children}
			</body>
		</html>
	)
}
