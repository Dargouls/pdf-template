import { NextResponse } from 'next/server';
import { chromium } from 'playwright-chromium';

export async function POST(request: Request) {
	try {
		const { html } = await request.json(); // seu HTML já renderizado
		const browser = await chromium.launch({
			args: ['--no-sandbox', '--disable-setuid-sandbox'],
		});
		const page = await browser.newPage();
		await page.setContent(html, { waitUntil: 'networkidle' });
		// Aguarda eventuais renderizações de gráficos, se necessário
		await page.waitForTimeout(1000);
		const pdfBuffer = await page.pdf({
			format: 'A4',
			printBackground: true,
			margin: { top: '10px', right: '10px', bottom: '10px', left: '10px' },
		});
		await browser.close();
		return new NextResponse(pdfBuffer, {
			headers: {
				'Content-Type': 'application/pdf',
				'Content-Disposition': 'inline; filename=laudo-medico.pdf',
			},
		});

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} catch (error: any) {
		console.error('Erro na geração do PDF:', error);
		return NextResponse.json({ message: `Erro interno no servidor: ${error.message}` }, { status: 500 });
	}
}
