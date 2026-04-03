import {
  Tabs as AriaTabs,
  TabList,
  Tab,
  TabPanel,
  type TabsProps as AriaTabsProps,
} from 'react-aria-components';
import { ReactNode } from 'react';
import { tv } from 'tailwind-variants';

const tabsStyles = tv({
  slots: {
    list: 'inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-600',
    tab: 'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nee-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[selected]:bg-white data-[selected]:text-gray-900 data-[selected]:shadow-sm',
    panel: 'mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nee-500 focus-visible:ring-offset-2',
  },
});

const { list, tab, panel } = tabsStyles();

export interface TabsProps extends AriaTabsProps {
  children: ReactNode;
  className?: string;
}

export const Tabs = ({ children, className, ...props }: TabsProps) => {
  return (
    <AriaTabs className={className} {...props}>
      {children}
    </AriaTabs>
  );
};

export const TabsList = ({ children, className }: { children: ReactNode; className?: string }) => {
  return <TabList className={list({ className })}>{children}</TabList>;
};

export const TabsTrigger = ({ children, ...props }: { children: ReactNode; id: string }) => {
  return (
    <Tab className={tab()} {...props}>
      {children}
    </Tab>
  );
};

export const TabsContent = ({ children, className, ...props }: { children: ReactNode; id: string; className?: string }) => {
  return (
    <TabPanel className={panel({ className })} {...props}>
      {children}
    </TabPanel>
  );
};
