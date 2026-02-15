import { useEffect, useRef } from 'react';
import apiClient from '../api/axiosInstance';
import { useToastNotifications } from '../hooks/useToast';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // Initial delay in ms

const AxiosInterceptor = () => {
    const { showError, showWarning } = useToastNotifications();
    
    // Use refs to track interceptor IDs for cleanup
    const interceptorId = useRef(null);

    useEffect(() => {
        // Response Interceptor
        interceptorId.current = apiClient.interceptors.response.use(
            (response) => response, // Return successful responses as is
            async (error) => {
                const originalRequest = error.config;

                // Handle Network Errors or Timeouts
                if (error.code === 'ECONNABORTED' || error.message === 'Network Error' || !error.response) {
                    
                    // Initialize retry count
                    originalRequest._retryCount = originalRequest._retryCount || 0;

                    if (originalRequest._retryCount < MAX_RETRIES) {
                        originalRequest._retryCount += 1;
                        
                        // Calculate exponential backoff delay
                        const delay = RETRY_DELAY * Math.pow(2, originalRequest._retryCount - 1);
                        
                        // Notify user (only on first retry to avoid spamming)
                        if (originalRequest._retryCount === 1) {
                            showWarning(`Network unstable. Retrying... (${originalRequest._retryCount}/${MAX_RETRIES})`);
                        }

                        // Wait and retry
                        await new Promise(resolve => setTimeout(resolve, delay));
                        return apiClient(originalRequest);
                    } else {
                        showError("Network connection failed. Please check your internet.");
                    }
                } 
                // Handle 500 Server Errors (Optional: Retry once?)
                else if (error.response && error.response.status >= 500) {
                     showError(`Server Error: ${error.response.status}. Please try again later.`);
                }

                return Promise.reject(error);
            }
        );

        return () => {
            if (interceptorId.current !== null) {
                apiClient.interceptors.response.eject(interceptorId.current);
            }
        };
    }, [showError, showWarning]);

    return null; // This component doesn't render anything visible
};

export default AxiosInterceptor;
