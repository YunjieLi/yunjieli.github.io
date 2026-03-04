import { useState } from "react";
import TopBar from "./TopBar";
import LeftNav from "./LeftNav";

export default function App() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("Dashboard");
  const [assetsOpen, setAssetsOpen] = useState(true);

  return (
    <div style={{display:"flex",flexDirection:"column",minHeight:"100vh",width:"100%",maxWidth:"100%",overflowX:"hidden",fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif"}}>
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
      <main style={{flex:1,minWidth:0,minHeight:0,overflowY:"auto",overflowX:"hidden",padding:40,background:"#fafafa"}}>
        <p style={{fontSize:11,color:"#bbb",textTransform:"uppercase",letterSpacing:1,margin:"0 0 8px"}}>TikTok Ads Manager</p>
        <h1 style={{margin:0,fontSize:22,fontWeight:600}}>{active}</h1>
        <p style={{color:"#aaa",marginTop:8,fontSize:14}}>Content for <strong>{active}</strong> goes here.</p>
      </main>
      </div>
    </div>
  );
}