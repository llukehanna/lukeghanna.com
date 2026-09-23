import type { ElementType, ComponentPropsWithoutRef, ComponentRef, ReactNode, Ref } from 'react'

type GlassProps<T extends ElementType> = {
  as?: T
  className?: string
  children?: ReactNode
  ref?: Ref<ComponentRef<T>>
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'className' | 'children' | 'ref'>

export function Glass<T extends ElementType = 'div'>({ as, className = '', children, ref, ...rest }: GlassProps<T>) {
  const Tag = (as ?? 'div') as ElementType
  return (
    <Tag ref={ref} className={`glass rounded-[16px] ${className}`} {...rest}>
      {children}
    </Tag>
  )
}
