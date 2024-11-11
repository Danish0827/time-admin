const express = require('express');
const pool = require("../config/db")
const authenticate =require('../lib')

const app = express();

//post api for hadeeth
app.post("/api/addTrusteeHadeeth", authenticate , async (req, res) => {
    const {masjidid, tdate, tnamaz_type, thadeeth } = req.body;
    const formattedHdate = new Date(tdate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        // year: 'numeric',
    }).replace(/\//g, '-');
    
    try {
        const addHadeethQuery = `
            INSERT INTO trusteehadeeth (masjid_id,tdate, thadeeth, tnamaz_type)
            VALUES ($1, $2, $3 ,$4)
        `;
        
        await pool.query(addHadeethQuery, [masjidid,formattedHdate, thadeeth, tnamaz_type]);
        res.status(200).send("Hadeeth Added Successfully!");
    } catch(error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


//get api for Hadeeth
app.get("/api/getTrusteeHadeeth" ,authenticate, async (req,res)=>{
    try{
        // const getHadeethQuery = "select * from trusteehadeeth"
        const getHadeethQuery = `
        SELECT h.*, COALESCE(t.thadeeth, '') AS trustee_hadeeth
FROM hadeeth h
LEFT JOIN trusteehadeeth t ON h.date = t.tdate 
                             AND h.namaz_type = t.tnamaz_type 
                             AND t.masjid_id = 21    
        `
        const thadeeth = await pool.query(getHadeethQuery);
        const rowCount = thadeeth.rows.length

        res.status(200).json({thadeeth: thadeeth.rows,rowCount: rowCount})
    }catch (error){
        console.error(error);
        res.status(500).send("Internal Server Error")
    }
});


//update api for Hadeeth
app.put("/api/updateTrusteeHadeeth/:thadeethid",authenticate, async (req, res) => {
    const { thadeethid } = req.params;
    const {masjidid, tdate, tnamaz_type, thadeeth } = req.body;
    const formattedHdate = new Date(tdate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        // year: 'numeric',
    }).replace(/\//g, '-');

    try {
        const existingHadeeth = await pool.query(`SELECT * FROM trusteehadeeth WHERE thadeeth_id = $1`, [thadeethid]);

        if (existingHadeeth.rows.length === 0) {
            res.status(404).send("Hadeeth Not Found");
        }

        const updateHadeethQuery = `
            UPDATE trusteehadeeth 
            SET tdate = $1, thadeeth = $2, tnamaz_type = $3 ,masjid_id =$4
            WHERE thadeeth_id = $5
        `;
        await pool.query(updateHadeethQuery, [formattedHdate, thadeeth, tnamaz_type,masjidid, thadeethid]);

        res.status(200).send("Hadeeth Updated Successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


//delete api for Hadeeth
app.delete("/api/deleteTrusteeHadeeth/:thadeethid" ,authenticate, async (req,res)=>{
    const {thadeethid} = req.params
    try{
        const deleteHadeethQuery = `delete from trusteehadeeth where thadeeth_id = '${thadeethid}'`
        await pool.query(deleteHadeethQuery);

        res.status(200).send("Hadeeth Deleted Successfully");
    }catch (error){
        console.error(error);
        res.status(500).send("Internal Server Error")
    }
});

module.exports = app;