import type { ElementType, ComponentPropsWithoutRef, ReactNode } from 'react'

type GlassProps<T extends ElementType> = {
  as?: T
  className?: string
  children?: ReactNode
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className' | 'children'>

export function Glass<T extends ElementType = 'div'>({ as, className = '', children, ...rest }: GlassProps<T>) {
  const Tag = (as ?? 'div') as ElementType
  return (
    <Tag className={`glass rounded-[16px] ${className}`} {...rest}>
      {children}
    </Tag>
  )
}
