import React from 'react';
import { useTranslation } from 'react-i18next';
import type { LegalPack, PackBlock } from '../../content/legal/pack';

function BlockView({ block, termLabel, definitionLabel }: {
  block: PackBlock;
  termLabel: string;
  definitionLabel: string;
}) {
  if (block.type === 'meta') {
    return <p className="mt-1 text-sm text-[#64748b]">{block.text}</p>;
  }
  if (block.type === 'heading') {
    return <h4 className="mt-6 text-base font-semibold text-[#0f172a]">{block.text}</h4>;
  }
  if (block.type === 'subheading') {
    return <h4 className="mt-8 text-lg font-semibold text-[#0f172a]">{block.text}</h4>;
  }
  if (block.type === 'paragraph') {
    return <p className="mt-3 text-[15px] leading-7 text-[#1e293b]">{block.text}</p>;
  }
  if (block.type === 'bullets') {
    return (
      <ul className="my-3 list-disc space-y-1 pl-5 text-[15px] leading-7 text-[#1e293b]">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }
  if (block.type === 'definitions') {
    return (
      <div className="my-4 overflow-x-auto">
        <table className="w-full min-w-[520px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-[#cbd5e1]">
              <th className="w-[34%] py-2 pr-3 font-semibold text-[#0f172a]">{termLabel}</th>
              <th className="py-2 font-semibold text-[#0f172a]">{definitionLabel}</th>
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row) => (
              <tr key={row.term} className="border-b border-[#e5e7eb] align-top">
                <td className="py-2 pr-3 font-semibold text-[#0f172a]">{row.term}</td>
                <td className="py-2 leading-6 text-[#334155]">{row.definition}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return (
    <div className="my-4 overflow-x-auto">
      <table className="w-full min-w-[520px] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-[#cbd5e1]">
            {block.headers.map((header) => (
              <th key={header} className="py-2 pr-3 font-semibold text-[#0f172a]">{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row) => (
            <tr key={row.join('|')} className="border-b border-[#e5e7eb] align-top">
              {row.map((cell, index) => (
                <td key={`${cell}-${index}`} className="py-2 pr-3 leading-6 text-[#334155]">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LegalPackView({ pack }: { pack: LegalPack }) {
  const { i18n } = useTranslation();
  const french = i18n.language.toLowerCase().startsWith('fr');
  const termLabel = french ? 'Terme' : 'Term';
  const definitionLabel = french ? 'Définition' : 'Definition';

  return (
    <article className="px-5 py-6 text-[#1e293b] sm:px-8">
      <header className="border-b border-[#e5e7eb] pb-6 text-center">
        <p className="text-sm font-semibold tracking-wide text-[#334155]">{pack.cover.company}</p>
        <h2 id="legal-scroll-title" className="mt-3 text-[1.7rem] font-semibold leading-tight text-[#0f172a]">
          {pack.cover.title}
        </h2>
        <p className="mt-2 text-base leading-6 text-[#475569]">{pack.cover.subtitle}</p>
        <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.14em] text-[#64748b]">
          {pack.cover.documentsLabel}
        </p>
        <ul className="mx-auto mt-3 max-w-md space-y-1 text-left text-sm leading-6 text-[#0f172a]">
          {pack.cover.documents.map((document) => (
            <li key={document}>{document}</li>
          ))}
        </ul>
        <p className="mt-5 text-sm text-[#64748b]">{pack.cover.version}</p>
        <p className="mt-1 text-sm text-[#64748b]">{pack.cover.address}</p>
      </header>

      {pack.parts.map((part) => (
        <section key={part.title} className="mt-8">
          <h3 className="border-b border-[#e5e7eb] pb-2 text-xl font-semibold text-[#0f172a]">{part.title}</h3>
          {part.blocks.map((block, index) => (
            <BlockView
              key={`${part.title}-${index}`}
              block={block}
              termLabel={termLabel}
              definitionLabel={definitionLabel}
            />
          ))}
        </section>
      ))}
    </article>
  );
}
