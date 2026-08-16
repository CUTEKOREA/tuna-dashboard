'use client';

import React from 'react';
import styles from './NowCard.module.css';

export function NowCard({
  now = false,
  eyebrow,
  title,
  children,
  className,
  as: Tag = 'article',
  onClick,
}: {
  now?: boolean;
  eyebrow?: string;
  title: string;
  children?: React.ReactNode;
  className?: string;
  as?: 'article' | 'button' | 'div';
  onClick?: () => void;
}) {
  return (
    <Tag
      className={`${styles.card} ${now ? styles.now : ''} ${className ?? ''}`}
      data-now={now ? 'true' : 'false'}
      onClick={onClick}
      type={Tag === 'button' ? 'button' : undefined}
    >
      <div className={styles.meta}>
        {eyebrow ? <span className={styles.eyebrow}>{eyebrow}</span> : null}
        {now ? <span className={styles.chip}>지금</span> : null}
      </div>
      <strong className={styles.title}>{title}</strong>
      {children ? <div className={styles.body}>{children}</div> : null}
    </Tag>
  );
}
