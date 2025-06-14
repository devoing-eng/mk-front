// components/SlippageModal.tsx
import { ChangeEvent, useEffect, useState } from 'react'
import { IoClose } from 'react-icons/io5'

type SlippageModalProps = {
  isOpen: boolean
  onClose: () => void
  onSelectSlippage: (value: number) => void
  currentSlippage: number
}

const SLIPPAGE_PRESETS = [1, 2, 3, 4, 5, 10, 15, 20, 25]

export default function SlippageModal({
  isOpen,
  onClose,
  onSelectSlippage,
  currentSlippage,
}: SlippageModalProps) {
  const [customSlippage, setCustomSlippage] = useState<string>('')

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  if (!isOpen) return null

  const handleCustomSlippageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '' || (/^\d*\.?\d*$/.test(value) && parseFloat(value) <= 25)) {
      setCustomSlippage(value)
    }
  }

  const handleCustomSlippageSubmit = () => {
    const value = parseFloat(customSlippage)
    if (!isNaN(value) && value <= 25) {
      onSelectSlippage(value)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-30"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md rounded-lg bg-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-white">
              Set Maximum Slippage
            </h2>
            <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-gray-400 hover:text-white"
            aria-label="Close modal"
            >
                <IoClose size={20} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {SLIPPAGE_PRESETS.map((value) => (
              <button
                key={value}
                onClick={() => {
                  onSelectSlippage(value)
                  onClose()
                }}
                className={`p-2 rounded-lg ${
                  currentSlippage === value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                }`}
              >
                {value}%
              </button>
            ))}
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Custom Slippage
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customSlippage}
                onChange={handleCustomSlippageChange}
                placeholder="Enter value"
                className="bg-gray-700 text-white px-3 py-2 rounded-lg w-1/2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              <span className="text-gray-200">%</span>
            </div>
            {parseFloat(customSlippage) > 25 && (
              <p className="text-red-500 text-sm mt-1">
                Maximum slippage is 25%
              </p>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-700 text-white hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleCustomSlippageSubmit}
              disabled={!customSlippage || parseFloat(customSlippage) > 25}
              className="px-4 py-2 rounded-lg bg-indigo-200 text-black hover:bg-indigo-600 hover:text-white disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}