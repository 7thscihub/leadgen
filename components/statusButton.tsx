import React 
import { updateLead } from "@/services/leads"


export default Function StatusButton({ lead, buttonStatus }){
    const [ currentStatus, setCurrentStatus ] = React.useState(staus)
    const []
    const handlePress = async () => {
    
        lead.status = buttonStatus
        await updateLead(id=lead.id, chages=lead)
    }

    return (
        <Pressable 
            key={s} 
            onPress={handlePress} 
            style={[styles.status, currentStatus === s && styles.statusActive]}>
            <Text style={[styles.statusText, currentStatus === s && styles.statusTextActive]}>{s}</Text>
        </Pressable>
    )
}


const styles = StyleSheet.create({
    statusBox: { 
        marginBottom: 20 
    },
    statuses: { 
        flexDirection: "row", 
        flexWrap: "wrap", 
        gap: 7 
    },
    status: { 
        paddingHorizontal: 12, 
        paddingVertical: 9, 
        borderRadius: 12, 
        backgroundColor: "#fff", 
        borderWidth: 1, 
        borderColor: "#E2E8F0" 
    },
    statusActive: { 
        backgroundColor: "#111827", 
        borderColor: "#111827" 
    },
    statusText: { 
        color: "#64748B", 
        fontSize: 12, 
        fontWeight: "700", 
        textTransform: "capitalize" 
    },
    statusTextActive: { 
        color: "#fff" 
    },
    save: { 
        height: 52, 
        borderRadius: 15, 
        backgroundColor: "#111827", 
        alignItems: "center", 
        justifyContent: "center", 
        marginTop: 8 
    },
    saveText: { 
        color: "#fff", 
        fontWeight: "800", 
        fontSize: 15 
    }
});


