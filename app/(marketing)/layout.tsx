import TopNavBar from "./_components/TopNavBar";
import WhatsappFloatButton from "./_components/WhatsappFloatButton";

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <TopNavBar />
      {children}
      <WhatsappFloatButton />
    </>
  );
}
