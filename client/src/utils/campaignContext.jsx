import { createContext, useContext, useState , useEffect} from "react";
import axios from 'axios'

const CampaignContext = createContext()

export const CampaignProvider = ({children}) => {
    const [campaigns, setCampaigns] = useState([])
    const [processing, setLoading] = useState(false)

    const fetchCampaigns = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_DEV_ENDPOINT}/api/crowdfunding`);
            setCampaigns(response.data);
            console.log(response.data)
        } catch (error) {
            console.error("Error fetching campaigns:", error);
        } finally {
            setLoading(false);
        }
    };

    // Update campaign amount after payment
    const updateCampaignAmount = async (campaignId) => {
        try {
            await axios.post(`${import.meta.env.VITE_DEV_ENDPOINT}/api/update-campaign?c=${campaignId}`);
            await fetchCampaigns(); // Refresh campaigns after updating amount
        } catch (error) {
            console.error("Error updating campaign:", error);
        }
    };

    useEffect(() => {
        fetchCampaigns()
    }, [])

    return (
        <CampaignContext.Provider value={{campaigns, setCampaigns, updateCampaignAmount, processing}}>
            {children}            
        </CampaignContext.Provider>
    )
}

export const useCampaigns = () => {
    return useContext(CampaignContext)
}