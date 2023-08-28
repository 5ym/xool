import hljs from "highlight.js";

export default function CodeBlock(props: { code: string; language: string }) {
  const highlightedCode: string = hljs.highlight(props.code, {
    language: props.language,
  }).value;
  return (
    <pre className="overflow-scroll p-1 mb-4 bg-gray-800 text-white">
      <code dangerouslySetInnerHTML={{ __html: highlightedCode }} />
    </pre>
  );
}
