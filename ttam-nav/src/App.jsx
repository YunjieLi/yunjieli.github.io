import { useState } from "react";
import TopBar from "./TopBar";
import LeftNav from "./LeftNav";
import CampaignsPage from "./CampaignsPage";
import DashboardPage from "./DashboardPage";
import PageWithSections from "./PageWithSections";
import { PAGE_CONTENT } from "./pageContent";

export default function App() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("Dashboard");
  const [assetsOpen, setAssetsOpen] = useState(true);

  const pageConfig = PAGE_CONTENT[active];
  const isScrollablePage = active === "Dashboard" || pageConfig;
  const mainStyle = {
    flex: 1,
    minWidth: 0,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    ...(active === "Campaigns" && { overflow: "hidden" }),
    ...(isScrollablePage && { overflowY: "auto", overflowX: "hidden", background: "#fafafa" }),
    ...(!isScrollablePage && active !== "Campaigns" && { overflowY: "auto", overflowX: "hidden", padding: 40, background: "#fafafa" }),
  };

  return (
    <div style={{display:"flex",flexDirection:"column",minHeight:"100vh",width:"100%",maxWidth:"100%",overflowX:"hidden",fontFamily:'"TikTok Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}>
      <TopBar />
      <div style={{display:"flex",flex:1,minHeight:0,minWidth:0,overflow:"hidden"}}>
      <LeftNav
        open={open}
        onToggleOpen={setOpen}
        active={active}
        onActiveChange={setActive}
        assetsOpen={assetsOpen}
        onAssetsOpenChange={setAssetsOpen}
      />
      <main style={mainStyle}>
        {active === "Campaigns" ? (
          <CampaignsPage />
        ) : active === "Dashboard" ? (
          <DashboardPage />
        ) : pageConfig ? (
          <PageWithSections title={pageConfig.title} subtitle={pageConfig.subtitle} sections={pageConfig.sections} />
        ) : (
          <>
            <p style={{fontSize:11,color:"#bbb",textTransform:"uppercase",letterSpacing:1,margin:"0 0 8px"}}>TikTok Ads Manager</p>
            <h1 style={{margin:0,fontSize:22,fontWeight:600}}>{active}</h1>
            <p style={{color:"#aaa",marginTop:8,fontSize:14}}>Content for <strong>{active}</strong> goes here.</p>
          </>
        )}
      </main>
      </div>
    </div>
  );
}