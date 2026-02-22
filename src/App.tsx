/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Camera, 
  History, 
  Heart, 
  RefreshCw, 
  ChevronLeft, 
  Trash2,
  Check,
  X,
  CreditCard
} from 'lucide-react';

// Types
interface OutfitRecord {
  id: string;
  date: string;
  style: string;
  image?: string;
  note: string;
}

const ITEM_SUGGESTIONS = [
  "藍色襯衫 + 灰色牛仔褲 + 白色板鞋 (Blue Shirt, Grey Jeans & White Sneakers)",
  "白色素T + 深藍色直筒褲 + 經典帆布鞋 (White Tee, Navy Pants & Canvas Shoes)",
  "黑色連帽衛衣 + 卡其色工裝褲 + 黑色運動鞋 (Black Hoodie, Khaki Cargo Pants & Black Runners)",
  "條紋襯衫 + 黑色西裝短褲 + 樂福鞋 (Striped Shirt, Black Shorts & Loafers)",
  "米色針織衫 + 咖啡色百褶裙 + 瑪莉珍鞋 (Beige Knit, Brown Skirt & Mary Janes)",
  "牛仔外套 + 灰色棉褲 + 高筒帆布鞋 (Denim Jacket, Grey Sweatpants & High-top Canvas)",
  "淺綠色亞麻衫 + 白色寬褲 + 涼鞋 (Light Green Linen Shirt, White Wide-leg Pants & Sandals)",
  "深灰色毛衣 + 黑色皮裙 + 短靴 (Dark Grey Sweater, Black Leather Skirt & Ankle Boots)",
  "粉色襯衫 + 淺藍色牛仔褲 + 淺色老爹鞋 (Pink Shirt, Light Blue Jeans & Chunky Sneakers)",
  "藏青色 Polo 衫 + 白色休閒褲 + 德訓鞋 (Navy Polo, White Chinos & Army Trainers)",
  "格紋西裝外套 + 黑色緊身褲 + 尖頭平底鞋 (Plaid Blazer, Black Skinny Pants & Pointed Flats)",
  "黃色衛衣 + 深灰色運動褲 + 復古慢跑鞋 (Yellow Sweatshirt, Charcoal Joggers & Retro Runners)"
];

const STORAGE_KEY = 'item_records_v1';

export default function App() {
  const [view, setView] = useState<'home' | 'result' | 'records' | 'donate'>('home');
  const [currentItem, setCurrentItem] = useState<string>('');
  const [records, setRecords] = useState<OutfitRecord[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load records
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setRecords(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse records", e);
      }
    }
  }, []);

  // Save records
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [records]);

  const drawItem = () => {
    setIsDrawing(true);
    setCapturedImage(null);
    setNote('');
    
    // Simulate drawing animation
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * ITEM_SUGGESTIONS.length);
      setCurrentItem(ITEM_SUGGESTIONS[randomIndex]);
      setIsDrawing(false);
      setView('result');
    }, 1500);
  };

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("無法存取相機，請檢查權限。");
      setShowCamera(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
      tracks.forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const saveRecord = () => {
    const newRecord: OutfitRecord = {
      id: Date.now().toString(),
      date: new Date().toLocaleString(),
      style: currentItem,
      image: capturedImage || undefined,
      note: note
    };
    setRecords([newRecord, ...records]);
    setView('records');
  };

  const deleteRecord = (id: string) => {
    setRecords(records.filter(r => r.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-[#5A5A40] font-serif selection:bg-[#5A5A40] selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-[#5A5A40]/10 z-50 px-6 py-4 flex justify-between items-center">
        <h1 
          className="text-xl font-bold tracking-tight cursor-pointer flex items-center gap-2"
          onClick={() => setView('home')}
        >
          <Sparkles className="w-5 h-5" />
          穿搭抽籤
        </h1>
        <div className="flex gap-6 text-sm font-sans uppercase tracking-widest font-semibold">
          <button onClick={() => setView('records')} className="hover:opacity-60 transition-opacity flex items-center gap-1">
            <History className="w-4 h-4" /> 紀錄
          </button>
          <button onClick={() => setView('donate')} className="hover:opacity-60 transition-opacity flex items-center gap-1">
            <Heart className="w-4 h-4" /> 贊助
          </button>
        </div>
      </nav>

      <main className="pt-24 pb-12 px-6 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          {view === 'home' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center py-20"
            >
              <div className="mb-12">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mx-auto shadow-xl border border-[#5A5A40]/5 mb-8">
                  <Sparkles className={`w-12 h-12 text-[#5A5A40] ${isDrawing ? 'animate-spin' : ''}`} />
                </div>
                <h2 className="text-4xl font-light mb-4">今天穿什麼？</h2>
                <p className="text-[#5A5A40]/60 italic">讓命運為你挑選今日的具體單品建議</p>
              </div>

              <button
                disabled={isDrawing}
                onClick={drawItem}
                className="olive-button text-lg px-12 py-4 bg-[#5A5A40] text-white rounded-full hover:scale-105 transition-transform disabled:opacity-50"
              >
                {isDrawing ? '抽籤中...' : '開始抽籤'}
              </button>
            </motion.div>
          )}

          {view === 'result' && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="space-y-8"
            >
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-[#5A5A40]/5 text-center">
                <span className="text-xs uppercase tracking-[0.2em] opacity-60 mb-2 block">今日建議單品</span>
                <h2 className="text-3xl font-medium mb-8">{currentItem}</h2>
                
                <div className="flex justify-center gap-4">
                  <button 
                    onClick={drawItem}
                    className="p-4 rounded-full border border-[#5A5A40]/20 hover:bg-[#5A5A40]/5 transition-colors"
                    title="重新抽籤"
                  >
                    <RefreshCw className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-[#5A5A40]/5">
                <h3 className="text-xl mb-6 flex items-center gap-2">
                  <Camera className="w-5 h-5" /> 拍照記錄
                </h3>

                {capturedImage ? (
                  <div className="relative rounded-2xl overflow-hidden mb-6 aspect-[3/4] bg-gray-100">
                    <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setCapturedImage(null)}
                      className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full backdrop-blur-md"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : showCamera ? (
                  <div className="relative rounded-2xl overflow-hidden mb-6 aspect-[3/4] bg-black">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4">
                      <button 
                        onClick={capturePhoto}
                        className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-white/30"
                      >
                        <div className="w-12 h-12 bg-white border-2 border-[#5A5A40] rounded-full" />
                      </button>
                      <button 
                        onClick={stopCamera}
                        className="absolute right-6 bottom-4 p-2 text-white/80"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={startCamera}
                    className="w-full py-12 border-2 border-dashed border-[#5A5A40]/20 rounded-2xl flex flex-col items-center gap-3 hover:bg-[#5A5A40]/5 transition-colors mb-6"
                  >
                    <Camera className="w-8 h-8 opacity-40" />
                    <span className="text-sm opacity-60">點擊開啟相機</span>
                  </button>
                )}

                <div className="space-y-4">
                  <label className="block text-sm font-sans font-semibold uppercase tracking-wider opacity-60">穿搭筆記</label>
                  <textarea 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="今天穿了什麼單品？心情如何？"
                    className="w-full p-4 rounded-xl border border-[#5A5A40]/10 focus:outline-none focus:ring-1 focus:ring-[#5A5A40] font-sans text-sm min-h-[100px]"
                  />
                </div>

                <button 
                  onClick={saveRecord}
                  className="w-full mt-8 py-4 bg-[#5A5A40] text-white rounded-full font-sans font-bold uppercase tracking-widest hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" /> 儲存紀錄
                </button>
              </div>
            </motion.div>
          )}

          {view === 'records' && (
            <motion.div 
              key="records"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-light">穿搭紀錄</h2>
                <button onClick={() => setView('home')} className="text-sm font-sans uppercase tracking-widest flex items-center gap-1 opacity-60 hover:opacity-100">
                  <ChevronLeft className="w-4 h-4" /> 返回
                </button>
              </div>

              {records.length === 0 ? (
                <div className="text-center py-20 opacity-40 italic">
                  目前還沒有紀錄，快去抽一個吧！
                </div>
              ) : (
                <div className="grid gap-6">
                  {records.map((record) => (
                    <div key={record.id} className="bg-white p-6 rounded-[24px] shadow-sm border border-[#5A5A40]/5 flex gap-6">
                      {record.image && (
                        <div className="w-24 h-32 rounded-xl overflow-hidden flex-shrink-0">
                          <img src={record.image} alt="Outfit" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-[10px] font-sans uppercase tracking-widest opacity-40">{record.date}</span>
                          <button 
                            onClick={() => deleteRecord(record.id)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <h4 className="text-lg font-medium mb-2 truncate">{record.style}</h4>
                        <p className="text-sm opacity-60 line-clamp-2 font-sans">{record.note || '無備註'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {view === 'donate' && (
            <motion.div 
              key="donate"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto"
            >
              <div className="bg-white p-10 rounded-[40px] shadow-xl border border-[#5A5A40]/5 text-center">
                <div className="w-20 h-20 bg-[#f5f5f0] rounded-full flex items-center justify-center mx-auto mb-8">
                  <Heart className="w-10 h-10 text-[#5A5A40]" />
                </div>
                <h2 className="text-3xl font-light mb-4">支持我們</h2>
                <p className="text-[#5A5A40]/60 mb-10 font-sans leading-relaxed">
                  如果你喜歡這個穿搭抽籤小工具，歡迎透過 Google Play 贊助我們，讓我們能持續開發更多有趣的功能！
                </p>

                <div className="space-y-4">
                  {[
                    { amount: 'NT$ 30', label: '一杯咖啡' },
                    { amount: 'NT$ 150', label: '一份午餐' },
                    { amount: 'NT$ 500', label: '開發者的動力' }
                  ].map((item) => (
                    <button 
                      key={item.amount}
                      onClick={() => alert(`感謝您的心意！即將跳轉至 Google Play 支付介面 (${item.amount})`)}
                      className="w-full p-4 rounded-2xl border border-[#5A5A40]/10 hover:bg-[#5A5A40] hover:text-white transition-all group flex justify-between items-center"
                    >
                      <div className="text-left">
                        <div className="font-bold font-sans">{item.amount}</div>
                        <div className="text-xs opacity-60 group-hover:text-white/80">{item.label}</div>
                      </div>
                      <CreditCard className="w-5 h-5 opacity-40 group-hover:opacity-100" />
                    </button>
                  ))}
                </div>

                <div className="mt-10 pt-8 border-top border-[#5A5A40]/10">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/d/d0/Google_Play_Arrow_logo.svg" alt="Google Play" className="w-4 h-4" />
                    <span className="text-xs font-sans font-bold uppercase tracking-widest opacity-40">Secure Payment via Google Play</span>
                  </div>
                  <button 
                    onClick={() => setView('home')}
                    className="text-sm font-sans uppercase tracking-widest opacity-60 hover:opacity-100"
                  >
                    返回首頁
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Hidden Canvas for Photo Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-6 text-center pointer-events-none">
        <p className="text-[10px] font-sans uppercase tracking-[0.3em] opacity-20">
          © 2024 Outfit Draw Platform
        </p>
      </footer>
    </div>
  );
}
