type CollectionMarkProps = {
  className?: string;
};

export function CollectionMark({ className = "" }: CollectionMarkProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 260 118"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        className="text-forest-800"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      >
        <path d="M12 96h236" />
        <path d="M18 102h188" strokeDasharray="3.5 5" />

        <path d="M38 28h16" />
        <path d="M24 42c9-11 31-11 40 0H24Z" />
        <path d="M26 42 30 86h28l4-44" />
        <path d="M32 60h24" />
        <circle cx="34" cy="90" r="4" />
        <circle cx="54" cy="90" r="4" />

        <path d="M96 68h40v28H96Z" />
        <path d="M104 74h20v10h-20Z" />
        <path d="M136 48h92v48H136Z" />
        <path d="M144 58h76" />
        <path d="M144 68h30" />
        <path d="M88 96h148" />
        <path d="M86 88h10v8H86Z" />
        <path d="M90 80c3-4 8-5 12-3" />
        <circle cx="114" cy="96" r="8.5" />
        <circle cx="114" cy="96" r="2.75" />
        <circle cx="208" cy="96" r="8.5" />
        <circle cx="208" cy="96" r="2.75" />
        <path d="M220 56v8" />
      </g>
      <g
        className="text-marigold-500"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      >
        <path d="M144 78h76" />
        <path d="M34 42h20" />
      </g>
    </svg>
  );
}
