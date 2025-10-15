

const getScheme = async (req,res) => {
    try {
        const schemeList = await scheme        
    } catch (error) {
        res.status(500).json({message:"server error"})
    }
}