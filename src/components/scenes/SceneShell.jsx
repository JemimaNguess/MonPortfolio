// Conteneur commun aux scènes : laisse de la place à l'en-tête et à la barre du bas.
export default function SceneShell({ children, className = '' }) {
  return (
    <section className={`scene-enter mx-auto min-h-dvh w-full max-w-[1360px] px-5 pb-[260px] pt-24 md:px-10 md:pb-[230px] md:pt-28 ${className}`}>
      {children}
    </section>
  );
}
