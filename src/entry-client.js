import Counter from './Counter.svelte';

const counter = new Counter({
	target: document.getElementById('svelte'),
	hydrate: true
});

export default counter;
