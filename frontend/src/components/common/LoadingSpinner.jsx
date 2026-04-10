// A reusable loading spinner component
function LoadingSpinner({message = 'Loading...'}) {
    return (
        <div className="text-center py-10">
            {/* Spinner animation using CSS */}
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>

            {/* Loading message (customizable via props) */}
            <div className="mt-2 text-gray-600">{message}</div>
        </div>

    )
}

export default LoadingSpinner;