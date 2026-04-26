import SouqFlowHeader from '@/components/SouqFlowHeader';
import SouqFlowFooter from '@/components/SouqFlowFooter';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SouqFlowHeader />
      {children}
      <SouqFlowFooter />
    </>
  );
}
