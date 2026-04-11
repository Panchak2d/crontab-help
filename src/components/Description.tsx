interface Props {
  description: string;
  isError: boolean;
  isEmpty: boolean;
}

export function Description({ description, isError, isEmpty }: Props) {
  const textClass = isEmpty
    ? 'description-text--empty'
    : isError
    ? 'description-text--error'
    : '';

  return (
    <div className="description-panel">
      <p className={`description-text ${textClass}`}>
        {description}
      </p>
    </div>
  );
}
