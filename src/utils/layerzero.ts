// src/utils/layerzero.ts

import { createClient, MessageStatus } from '@layerzerolabs/scan-client';

export async function getLayerZeroMessageStatus(txHash: string): Promise<MessageStatus | null> {
  try {
    const client = createClient('mainnet');
    const { messages } = await client.getMessagesBySrcTxHash(txHash);
    
    if (messages && messages.length > 0) {
      // Get the latest/relevant message
      const message = messages[0];
      return message.status;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching LayerZero message status:', error);
    throw error;
  }
}

export { MessageStatus };