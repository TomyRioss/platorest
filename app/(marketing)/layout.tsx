import TopNavBar from "./_components/TopNavBar";
import Footer from "./_components/Footer";
import WhatsappFloatButton from "./_components/WhatsappFloatButton";

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <TopNavBar />
      {children}
      <Footer />
      <WhatsappFloatButton />
    </>
  );
}
