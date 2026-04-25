import React, { useEffect, useRef, useState } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import axios from "axios";
import "./App.css";

const App = () => {

const [inputText,setInputText] = useState("")
const [translatedText,setTranslatedText] = useState("")

const [targetLanguage,setTargetLanguage] = useState("kn")
const [listeningLanguage,setListeningLanguage] = useState("en-IN")

const [autoSpeak,setAutoSpeak] = useState(false)
const [realTime,setRealTime] = useState(true)

const [loading,setLoading] = useState(false)
const [error,setError] = useState("")

const inputRef = useRef(null)

const { transcript,listening,resetTranscript } = useSpeechRecognition()

/* 🧠 Language Map */
const voiceMap = {
  en:"en-US",hi:"hi-IN",kn:"kn-IN",ta:"ta-IN",te:"te-IN",
  ml:"ml-IN",mr:"mr-IN",
  es:"es-ES",fr:"fr-FR",de:"de-DE",
  ja:"ja-JP",zh:"zh-CN"
}

/* 🎤 MIC */
const toggleMic = () => {
  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    alert("Speech recognition not supported")
    return
  }

  if (listening) {
    SpeechRecognition.stopListening()
  } else {
    SpeechRecognition.startListening({
      continuous:true,
      language:listeningLanguage
    })
  }
}

/* 🎤 TRANSCRIPT */
useEffect(()=>{
  if(transcript){
    setInputText(transcript)
  }
},[transcript])

/* 🔁 REALTIME */
useEffect(()=>{
  if(realTime && inputText){
    translateText(inputText)
  }
},[inputText])

/* 🔊 SPEAK */
const speakText = (text,lang)=>{
  if(!text) return
  window.speechSynthesis.cancel()

  const speech = new SpeechSynthesisUtterance(text)
  speech.lang = voiceMap[lang] || "en-US"

  window.speechSynthesis.speak(speech)
}

/* 🌍 TRANSLATE USING HUGGING FACE */
const translateText = async (text)=>{
  const sourceLang = listeningLanguage.split("-")[0]
  if(sourceLang === targetLanguage) return
  if(!text.trim()) return

  try{
    setLoading(true)
    setError("")

    const res = await axios.post(
      "https://api-inference.huggingface.co/models/facebook/nllb-200-distilled-600M",
      { inputs: text },
      {
        headers:{
          Authorization:`Bearer ${import.meta.env.VITE_HF_API_KEY}`
        }
      }
    )

    const output = res.data?.[0]?.translation_text || "Translation failed"

    setTranslatedText(output)

    if(autoSpeak){
      speakText(output,targetLanguage)
    }

  }catch(e){
    console.error(e)
    setError("Translation failed. Try again.")
  }finally{
    setLoading(false)
  }
}

/* 🔄 RESET */
const resetInput = ()=>{
  setInputText("")
  resetTranscript()
}

const resetOutput = ()=>{
  setTranslatedText("")
  window.speechSynthesis.cancel()
}

/* 📋 COPY */
const copyText = (text)=>{
  navigator.clipboard.writeText(text)
}

return(

<div className="app">

<h1>🌍 AI Translation System</h1>

<div className="panel">

<select value={listeningLanguage} onChange={e=>setListeningLanguage(e.target.value)}>
  <option value="en-IN">English</option>
  <option value="hi-IN">Hindi</option>
  <option value="kn-IN">Kannada</option>
</select>

<textarea
  ref={inputRef}
  placeholder="Speak or type..."
  value={inputText}
  onChange={e=>setInputText(e.target.value)}
/>

<button onClick={toggleMic}>
  {listening ? "🎤 Stop" : "🎤 Start"}
</button>

<button onClick={()=>translateText(inputText)}>Translate</button>

<button onClick={resetInput}>Reset</button>

</div>

<div className="panel">

<select value={targetLanguage} onChange={e=>setTargetLanguage(e.target.value)}>
  <option value="kn">Kannada</option>
  <option value="hi">Hindi</option>
  <option value="en">English</option>
</select>

{loading && <p>⏳ Translating...</p>}
{error && <p style={{color:"red"}}>{error}</p>}

<div className="output">{translatedText}</div>

<button onClick={()=>copyText(translatedText)}>Copy</button>
<button onClick={resetOutput}>Reset</button>

<button onClick={()=>speakText(translatedText,targetLanguage)}>
🔊 Speak
</button>

</div>

</div>
)
}

export default App