import { tv, type VariantProps } from 'tailwind-variants';

const skeletonStyles = tv({
  base: 'animate-pulse rounded-md bg-gray-200',
});

export interface SkeletonProps extends VariantProps<typeof skeletonStyles> {
  className?: string;
}

export const Skeleton = ({ className }: SkeletonProps) => {
  return <div className={skeletonStyles({ className })} />;
};
