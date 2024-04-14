"use client";

import { useState, useEffect, useRef } from 'react';

import QRCode from "react-qr-code";
import Confetti from 'react-confetti'
import useWindowSize from 'react-use/lib/useWindowSize'
import { Reclaim } from '@reclaimprotocol/js-sdk';
import { data } from 'autoprefixer';

const APP_ID = process.env.NEXT_PUBLIC_APP_ID
const APP_SECRET = process.env.NEXT_PUBLIC_APP_SECRET

const providers = [
  { name: "Aadhaar Card Date of Birth", providerId: '5e1302ca-a3dd-4ef8-bc25-24fcc97dc800' },
  { name: "Alaska Airlines Miles", providerId: 'f1ecc692-cf13-4f45-9b91-ea1459875f07' },
  { name: "Coinbase Completed KYC", providerId: '285a345c-c6a6-4b9f-9e1e-23432082c0a8' },
  { name: "Kaggle username", providerId: 'c94476a0-8a75-4563-b70a-bf6124d7c59b' },
  { name: "Hugging Face username dbg", providerId: 'aaa47198-2523-40da-b9a9-bfa290730d52' },
  { name: "Swiggy Last Order Address", providerId: '49e2e77c-1921-4c0a-bd8f-f14092d7e516' },
  { name: "Swiggy Addressbook", providerId: 'eeaa0f1a-d7ae-4fe1-a382-36119326cc17' },
  { name: "Swiggy Last 3 delivery Address", providerId: '4800d18c-59c7-48af-94c5-bc53f8c6db6e' },
  { name: "Binance KYC Level", providerId: '2b22db5c-78d9-4d82-84f0-a9e0a4ed0470' },
  { name: "OKX KYC level", providerId: '6de34e9f-06b0-4974-8ab3-93623c783078' },
  { name: "Atleast one Uber Ride", providerId: '55535317-71ad-4cac-9a38-22652e64be9e' }
];




export default function Home() {

  const [url, setUrl] = useState('')
  const [isMobileDevice, setIsMobileDevice] = useState(false)
  const [showQR, setShowQR] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false);

  const [showButton, setShowButton] = useState(true)

  const [myProviders, setMyProviders] = useState(providers)

  const [selectedProviderId, setSelectedProviderId] = useState('')
 
  const [proofs, setProofs] = useState()

  const { width, height } = useWindowSize()

  const urlRef = useRef(null);

  const reclaimClient = new Reclaim.ProofRequest(APP_ID);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      console.log('Link copied to clipboard');
    } catch (err) {
      console.error('Failed to copy link: ', err);
    }
  };

  const getVerificationReq = async (providerId) => {
    try {
      await reclaimClient.buildProofRequest(providerId)
      reclaimClient.setSignature(await reclaimClient.generateSignature(APP_SECRET))
  
      const { requestUrl, statusUrl } = await reclaimClient.createVerificationRequest()
      console.log('requestUrl', requestUrl)
      console.log('statusUrl', statusUrl)
      setUrl(requestUrl)
      setShowQR(true)
      setShowButton(false)
  
      await reclaimClient.startSession({
        onSuccessCallback: proofs => {
          console.log('Verification success', proofs)
          // Your business logic here
          setProofs(proofs[0])
          setShowQR(false)
        },
        onFailureCallback: error => {
          console.error('Verification failed', error)
          // Your business logic here to handle the error
          console.log('error', error)
        }
      })
    } catch (error) {
      console.error('Error in getVerificationReq', error)
      // Handle error gracefully, e.g., show a notification to the user
      // and possibly revert UI changes made before the error occurred
    }
  }
  
  console.log('proofs', proofs)
  const handleButtonClick = (providerId) => {
    setIsCopied(false)
    setProofs(null)
    getVerificationReq(providerId)
  }

  useEffect(() => {
    let details = navigator.userAgent;
    let regexp = /android|iphone|kindle|ipad/i;

    let isMobileDevice = regexp.test(details);

    if (isMobileDevice) {
      setIsMobileDevice(true)
    } else {
      setIsMobileDevice(false)
    }

  }, [])


  useEffect(() => {
    if (proofs) {
      setShowConfetti(true);
      setTimeout(() => {
        setShowConfetti(false);
      }, 5000); // 10 seconds
    }
  }, [proofs]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 mt-8 gap-4 bg-black">
      <div className="z-10 w-full flex flex-col gap-4 items-center justify-center font-mono text-sm">
        <h2 className="text-slate-300 text-sm lg:text-4xl md:text-3xl sm:text-xl xs:text-xs text-nowrap">Welcome to Reclaim Protocol Demo</h2>
        <h4 className="text-slate-400 text-sm lg:text-xl md:text-lg sm:text-lg xs:text-xs">This demo uses <span className="text-slate-300 underline"><a href='https://www.npmjs.com/package/@reclaimprotocol/js-sdk'> @reclaimprotocol/js-sdk </a></span> to generate proofs of your web2 data</h4>
        <p className='text-slate-500'>Proofs generated by Reclaim Protocol are secure and private. <span className="text-slate-300 underline"><a href='https://blog.reclaimprotocol.org/posts/chacha-circuit-audit/'>Learn More</a></span></p>
        <select
          value={selectedProviderId}
          onChange={(e) => {
            setSelectedProviderId(e.target.value);
            setShowQR(false);
            setShowButton(false);
            handleButtonClick(e.target.value);
          }}
          className="w-full sm:w-auto px-3 py-2 text-xs sm:text-sm md:text-base text-black bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="" disabled>Select a proof you want to generate today</option>
          {myProviders.map((provider) => (
            <option key={provider.providerId} value={provider.providerId}>
              {provider.name}
            </option>
          ))}
        </select>

        {/* {showButton && (<button className="bg-blue-500 mt-8 hover:bg-blue-700 lg:text-lg md:text-base sm:text-lg text-gray-200 font-semibold py-2 px-4 rounded"
          onClick={handleButtonClick}
        >Generate Proof Of Ownership Of  </button>)} */}
        {showQR && (
          <>
            {!isMobileDevice && (
              <>
                <input ref={urlRef} value={url} readOnly style={{ opacity: 0, position: 'absolute', zIndex: -1 }} />
                {/* <button onClick={copyToClipboard} className="border-gray-500 border-2 px-2 hover:bg-gray-300 font-semibold rounded shadow">
                  {isCopied ? 'Copied!' : 'Copy Link'}</button> */}
                <div style={{ border: '16px solid white', marginTop: '20px' }}>
                  <QRCode value={url} />
                </div>

              </>
            )
            }
            {isMobileDevice && (
              <>
                <button onClick={() => window.open(url, "_blank")} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Open Link</button>
              </>
            )}
            <span className='text-gray-300'>
              <button onClick={copyToClipboard} className="border-gray-500 border-2 mt-8 px-2 hover:bg-gray-300 text-gray-400 font-semibold rounded shadow">
                {isCopied ? 'Copied!' : 'Copy Link'}</button>
            </span>
          </>
        )}
        {
          proofs && (
            <>
              <h3 className="text-slate-300 text-sm lg:text-2xl md:text-xl sm:text-lg xs:text-xs mt-8">Proofs Received</h3>
              
              {JSON.stringify(proofs)}
             
              {showConfetti && (
                <Confetti
                  width={width}
                  height={height}
                />
              )}
            </>
          )
        }
      </div>

    </main>
  );
}



// const objKeys = Object.keys(proof.extractedParameterValues)
// const objValues = Object.values(proof.extractedParameterValues)
// return (
//   <div key={index} className="flex flex-col gap-2 text-wrap justify-center items-center">
//     <pre className='text-wrap text-slate-400'>{objKeys.map((key, index) => {
//       return `${key}: ${objValues[index]}`
//     }).join('\n')}</pre>
//     {/* <code className='whitespace-pre-wrap'>{JSON.stringify(proof, null, 2)}</code> */}
//   </div>
// )