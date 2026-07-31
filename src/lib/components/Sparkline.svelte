<script lang="ts">
let {
	values,
	label,
	width = 132,
	height = 40,
}: {
	values: number[];
	label: string;
	width?: number;
	height?: number;
} = $props();

// Leaves room for the end marker so it is never clipped by the viewBox.
const pad = 5;

const points = $derived.by(() => {
	const max = Math.max(...values);
	const min = Math.min(...values);
	// A flat series would divide by zero, and it reads best down the middle.
	const span = max - min || 1;
	const step = (width - pad * 2) / (values.length - 1);
	return values.map((value, i) => ({
		x: pad + i * step,
		y:
			max === min
				? height / 2
				: height - pad - ((value - min) / span) * (height - pad * 2),
	}));
});

const path = $derived(
	points
		.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
		.join(" "),
);
const last = $derived(points[points.length - 1]);
</script>

{#if values.length > 1}
	<svg
		class="text-primary shrink-0"
		{width}
		{height}
		viewBox="0 0 {width} {height}"
		role="img"
		aria-label={label}
	>
		<title>{label}</title>
		<path
			d={path}
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
		<circle
			cx={last.x}
			cy={last.y}
			r="4"
			fill="currentColor"
			stroke="var(--color-base-100)"
			stroke-width="2"
		/>
	</svg>
{/if}
