/* eslint-disable @next/next/no-img-element */

// src/app/api/og/route.tsx

import { OGImageParams } from '@/app/types/openGraphType'
import { ApiClient } from '@/utils/apiClient';
import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'
 
export const runtime = 'edge'

// Helper function to check image type
const isAllowedImageType = (imageUrl: string) => {
  const extension = imageUrl.split('.').pop()?.toLowerCase();
  return extension === 'jpg' || 
         extension === 'jpeg' || 
         extension === 'png' || 
         extension === 'gif';
}
 
export async function GET(request: NextRequest) {
  const styles = {
    container: {
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom right, #0F172A, #1E293B)', // Dark blue gradient background
      padding: '60px',
    },
    heading: {
      fontSize: '64px',
      fontWeight: 800,
      letterSpacing: '-0.025em',
      color: 'white',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '16px',
      lineHeight: 1.2,
      fontFamily: 'Montserrat',
    },
    gradientText: {
      display: 'flex',
      gap: '12px',
      color: '#111012',
      textShadow: '0 0 20px rgba(129, 140, 248, 0.5)', // Glow effect
    },
    subtitle: {
      fontSize: '24px',
      color: '#e1e9f5',
      maxWidth: '700px',
      lineHeight: 1.5,
    },
    logo: {
      position: 'absolute' as const,
      bottom: '34px',
      right: '48px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      color: 'white',
      fontSize: '20px',
      fontWeight: 600,
    },
    textContainer: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      gap: '32px',
      textAlign: 'center' as const,
      padding: '40px',
      margin: '28px', // Add margin to give space for the border effect
      border: '2px solid #818cf8', // Primary border
      borderRadius: '24px',
      background: 'rgba(255, 255, 255, 0.05)',
      boxShadow: `
        0 0 0 4px rgba(129, 140, 248, 0.3),  // First glow layer
        0 0 0 8px rgba(129, 140, 248, 0.2),  // Second glow layer
        0 0 20px rgba(129, 140, 248, 0.5),   // Outer glow
        inset 0 0 30px rgba(129, 140, 248, 0.1)  // Inner glow
      `,
      position: 'relative' as const,
    },
    borderContainer: {
      display: 'flex',
      position: 'relative' as const,
      padding: '3px',  // Space for the border
      background: 'linear-gradient(45deg, #818cf8, #7c3aed, #818cf8)',
      borderRadius: '28px', // Slightly larger than textContainer
      boxShadow: '0 0 40px rgba(129, 140, 248, 0.5)', // Outer glow for the border
    },
  };

  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    let params: OGImageParams;

    if (type === 'coin') {
      const coinId = searchParams.get('coinId')
      if (!coinId) {
        throw new Error('coinId is required')
      }

      const coinData = await ApiClient.getCoin(coinId)
      
      if (!coinData) {
        throw new Error('Coin not found')
      }

      params = {
        type: 'coin',
        name: coinData.name || 'Kult Coin',
        ticker: coinData.ticker || 'KULT',
        description: coinData.description || 'A Kult on MemeKult',
        creatorAddress: coinData.creatorAddress,
        creatorUsername: coinData.creatorId || 'MemeKult Creator',
        tokenAddress: coinData.tokenAddress || '0xab34BEb34b03Df942216ee93f1F2be2dbe34e9E6',
        image: coinData.imageUrl || undefined,
        hasAudio: !!coinData.audioUrl 
      }
    } 
    else if (type === 'creator') {
      const userAddress = searchParams.get('userAddress')
      if (!userAddress) {
        throw new Error('user address is required')
      }
      
      const userData = await ApiClient.getUserDetails(userAddress)
      if (!userData) {
        throw new Error('Creator not found')
      }

      params = {
        type: 'creator',
        username: userData.data.username || 'Trader',
        image: userData.data.image || undefined
      }
    } 
    else {
      params = {
        type: 'default'
      }
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '630px',
            width: '1200px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#0D121F',
          }}
        >
          {params.type === 'coin' && (
            <div style={{
              ...styles.borderContainer,
              height: '100%',
              width: '100%',
              padding: '10px',  // Space for the border
              background: '#FE4002',
              borderRadius: '28px',
              boxShadow: '0 0 40px rgba(254, 64, 2, 0.5)', // Outer glow
            }}>
              <div style={{
                display: 'flex',
                width: '100%',
                height: '100%',
                borderRadius: '24px', // Slightly smaller than parent to show border
                overflow: 'hidden', // Keep content within bounds
                background: '#0F172A', // Dark background
              }}>
                {/* Left Side - Image */}
                <div style={{
                  width: '50%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderTopLeftRadius: '24px',    // Match parent's border radius
                  borderBottomLeftRadius: '24px', // Match parent's border radius
                  overflow: 'hidden',             // Important to contain the image within rounded borders
                }}>
                  {params.image && isAllowedImageType(params.image) ? (
                    <img 
                      src={params.image}
                      alt={params.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      width={630}
                      height={630}
                    />
                  ) : (
                    // Fallback Icon with background
                    <div style={{
                      width: '100%',
                      height: '100%',
                      background: '#0F172A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      <img 
                        src={`${process.env.NEXT_PUBLIC_APP_URL}/images/mk-logo-white.png`}
                        alt="MemeKult Logo"
                        style={{
                          width: '50%',
                          height: '50%',
                          objectFit: 'cover',
                        }}
                        width={130}
                        height={130}
                      />
                    </div>
                  )}
                </div>

                {/* Right Side - Content */}
                <div style={{
                  width: '50%',
                  padding: '40px',
                  display: 'flex',
                  flexDirection: 'column' as const,
                  gap: '32px',
                  position: 'relative',
                  justifyContent: 'space-between',
                }}>

                  {/* Logo in top-right corner */}
                  <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '15px',
                    width: '34px',
                    height: '34px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    background: 'rgba(129, 140, 248, 0.1)', // Subtle background
                    boxShadow: '0 0 15px rgba(129, 140, 248, 0.3)', // Gentle glow
                    padding: '4px',  // Add some padding around the logo
                  }}>
                    <img 
                      src={`${process.env.NEXT_PUBLIC_APP_URL}/images/mk-logo-white.png`}
                      alt="MemeKult Logo"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                      }}
                    />
                  </div>

                  {/* Main content container */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column' as const,
                    gap: '32px',
                  }}>
                    {/* Title Section */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column' as const,
                      gap: '16px',
                    }}>
                      {/* Main Title */}
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column' as const,
                        gap: '8px',
                      }}>
                        {/* Name and Ticker */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          fontSize: '56px',
                          fontWeight: 800,
                        }}>
                          <span style={{
                            color: '#e3bdff',
                            textShadow: '0 0 20px rgba(129, 140, 248, 0.5)',
                          }}>
                            {params.name} - {params.ticker}
                          </span>
                        </div>

                        {/* Audio Badge - only shows if hasAudio is true */}
                        {params.hasAudio && (
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            width: '40%',
                            backgroundColor: 'rgba(168, 85, 247, 0.2)',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            marginTop: '8px',
                            border: '2px solid #a855f7',
                          }}>
                            {/* SVG for musical note icon */}
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9 18V5L21 3V16" stroke="#e3bdff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="6" cy="18" r="3" stroke="#e3bdff" strokeWidth="2"/>
                              <circle cx="18" cy="16" r="3" stroke="#e3bdff" strokeWidth="2"/>
                            </svg>
                            
                            <span style={{
                              color: '#e3bdff',
                              fontSize: '20px',
                              fontWeight: 'bold',
                            }}>
                              AUDIO MEME
                            </span>
                          </div>
                        )}

                      </div>
                    </div>

                    {/* Bubbles Container */}
                    <div style={{
                      display: 'flex',
                      gap: '16px',
                      flexWrap: 'wrap' as const,
                    }}>
                      {/* CA Bubble */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: '#0F172A',
                        border: '2px solid #818cf8',
                        borderRadius: '20px',
                        overflow: 'hidden', // Ensures inner elements respect border radius
                      }}>
                        {/* Label section */}
                        <div style={{
                          display: 'flex',
                          background: 'rgba(129, 140, 248, 0.1)',
                          padding: '8px 16px',
                          color: '#bccfeb',
                          fontSize: '16px',
                          borderRight: '0.5px solid #818cf8',
                        }}>
                          CA
                        </div>
                        {/* Value section */}
                        <div style={{
                          display: 'flex',
                          padding: '8px 16px',
                          color: '#fff',
                          fontSize: '16px',
                          fontFamily: 'monospace',
                          fontWeight: 600,
                        }}>
                          {params.tokenAddress?.slice(0, 6)}...{params.tokenAddress?.slice(-4)}
                        </div>
                      </div>

                      {/* Creator Bubble */}
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: '#0F172A',
                        border: '2px solid #818cf8',
                        borderRadius: '20px',
                        overflow: 'hidden',
                      }}>
                        {/* Label section */}
                        <div style={{
                          display: 'flex',
                          background: 'rgba(129, 140, 248, 0.1)',
                          padding: '8px 16px',
                          color: '#bccfeb',
                          fontSize: '16px',
                          borderRight: '0.5px solid #818cf8',
                        }}>
                          Creator
                        </div>
                        {/* Value section */}
                        <div style={{
                          display: 'flex',
                          padding: '8px 16px',
                          color: '#fff',
                          fontSize: '16px',
                          fontWeight: 600,
                        }}>
                          {params.creatorAddress?.slice(0, 6)}...{params.creatorAddress?.slice(-4)}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div style={{
                      display: '-webkit-box',
                      color: '#e9eff7',
                      fontSize: '18px',
                      lineHeight: '1.6',
                      maxHeight: '16.0em', // 10 lines maximum
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      WebkitLineClamp: 10,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {params.description}
                    </div>
                  </div>

                  {/* Footer text */}
                  <div style={{
                    display: 'flex',
                    position: 'absolute',
                    bottom: '10px',
                    right: '20px',
                    justifyContent: 'flex-end',
                    color: '#e1e9f5',
                    fontSize: '14px',
                    fontWeight: 600,
                    marginTop: 'auto',
                  }}>
                    Buy on memekult.com
                  </div>

                </div>
              </div>
            </div>
          )}
          {params.type === 'creator' && (
            <>
              <div style={styles.borderContainer}>
                <div style={styles.textContainer}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '40px' 
                  }}>
                    {/* Profile Image Circle */}
                    <div style={{
                      width: '200px',
                      height: '200px',
                      borderRadius: '100%',
                      overflow: 'hidden',
                      background: '#818cf8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 0 30px rgba(129, 140, 248, 0.5)',
                      border: '4px solid rgba(255, 255, 255, 0.1)',
                    }}>
                    {params.image ? (
                      <img 
                        src={params.image}
                        alt={params.username}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    ) : (
                      // Fallback Avatar Icon
                      <svg width="120" height="120" viewBox="0 0 24 24" fill="white">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                      </svg>
                    )}
                    </div>

                    {/* Username Section */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column' as const,
                      gap: '12px',
                    }}>
                      <div style={{
                        ...styles.heading,
                        fontSize: '72px',
                        textAlign: 'left' as const,
                      }}>
                        Follow
                      </div>
                      <div style={{
                        ...styles.gradientText,
                        fontSize: '64px',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}>
                        @{params.username}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
                                
              <div style={styles.logo}>
                <span>MemeKult.com</span>
              </div>
            </>
          )}
          {params.type === 'default' && (
              <>
                <div style={{
                  ...styles.borderContainer,
                  height: '630px',
                  width: '1200px',
                }}>
                  <div style={{
                    ...styles.textContainer,
                    height: '93%',
                    width: '95%',
                  }}>
                    <div style={styles.heading}>
                        <div>Launch and Trade Coins on</div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={styles.gradientText}>Ethereum</span>
                        <span style={{ color: 'white' }}>with</span>
                        <span style={styles.gradientText}>~0 Gas</span>
                        </div>
                    </div>
                  
                    <p style={styles.subtitle}>
                        Enjoy Base L2&apos;s ultra-low gas fees with MemeKult before deploying on Ethereum.
                    </p>
                  </div>
                </div>
                  
                <div style={styles.logo}>
                  <span>MemeKult.com</span>
                </div>
              </>
          )}
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Montserrat',
            data: await fetch(
              new URL('../../../../public/fonts/montserrat-bold.woff', import.meta.url)
            ).then((res) => res.arrayBuffer()),
            weight: 700,
            style: 'normal',
          },
        ]
      }
    );
  } catch (error: unknown) {
    
    if (error instanceof Error) {
      console.error(`OG Image Error: ${error.name} - ${error.message}`)
      console.error(error.stack)
    } else if (typeof error === 'string') {
      console.error(`Unknown OG Image Error: ${String(error)}`)
    }

    return new ImageResponse(
      (
        <div style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0F172A',
          color: 'white',
          fontSize: '24px',
          padding: '40px',
        }}>
          Unable to generate image
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    )
  }
}