import express from 'express';
import vite from 'vite';
import { resolve } from 'path';
import { cwd } from 'process';
import { readFile } from 'fs/promises';
import svelte from '@svitejs/vite-plugin-svelte';
import preprocess from 'svelte-preprocess';

async function server() {
	const app = express();

	/** @type {vite.ViteDevServer} */
	const viteInstance = await vite.createServer({
		plugins: [
			svelte({
				// @ts-ignore
				hot: true,
				emitCss: true,
				compilerOptions: {
					dev: true,
					hydratable: true
				},
				preprocess: preprocess()
			})
		],
		server: { middlewareMode: true }
	});

	app.use(viteInstance.middlewares);

	app.use('*', async (req, res) => {
		const url = req.originalUrl;

		try {
			let template = await readFile(resolve(cwd(), 'index.html'), 'utf-8');
			template = await viteInstance.transformIndexHtml(url, template);
			const { default: component } = await viteInstance.ssrLoadModule(
				'/src/Counter.svelte'
			);
			const { render } = component;
			const Counter = await render();
			const html = template.replace('<!--ssr-outlet-->', Counter.html);
			res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
		} catch (e) {
			viteInstance.ssrFixStacktrace(e);
			console.error(e);
			res.status(500).end(e.message);
		}
	});

	app.listen(3000);
}

server();
