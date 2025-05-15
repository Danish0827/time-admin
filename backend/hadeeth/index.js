const express = require('express');
const pool = require("../config/db")
const authenticate = require('../lib')

const app = express();

//post api for hadeeth
app.post("/api/addHadeeth",authenticate, async (req, res) => {
    const { hdate, namaz_type, hadeeth } = req.body;
    const formattedHdate = new Date(hdate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        // year: 'numeric',
    }).replace(/\//g, '-');
    
    try {
        const addHadeethQuery = `
            INSERT INTO hadeeth (date, hadeeth, namaz_type)
            VALUES ($1, $2, $3)
        `;
        
        await pool.query(addHadeethQuery, [formattedHdate, hadeeth, namaz_type]);
        res.status(200).send("Hadeeth Added Successfully!");
    } catch(error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

//get api for Hadeeth
app.get("/api/getHadeeth" ,authenticate, async (req,res)=>{
    try{
        const getHadeethQuery = "select * from Hadeeth"
        const hadeeth = await pool.query(getHadeethQuery);
        const rowCount = hadeeth.rows.length

        res.status(200).json({hadeeth: hadeeth.rows,rowCount: rowCount})
    }catch (error){
        console.error(error);
        res.status(500).send("Internal Server Error")
    }
});


//update api for Hadeeth
app.put("/api/updateHadeeth/:hadeethid",authenticate, async (req, res) => {
    const { hadeethid } = req.params;
    const { hdate, hadeeth, namaz_type } = req.body;
    const formattedHdate = new Date(hdate).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        // year: 'numeric',
    }).replace(/\//g, '-');

    try {
        const existingHadeeth = await pool.query(`SELECT * FROM hadeeth WHERE hadeeth_id = $1`, [hadeethid]);

        if (existingHadeeth.rows.length === 0) {
            res.status(404).send("Hadeeth Not Found");
        }

        const updateHadeethQuery = `
            UPDATE hadeeth 
            SET date = $1, hadeeth = $2, namaz_type = $3 
            WHERE hadeeth_id = $4
        `;
        await pool.query(updateHadeethQuery, [formattedHdate, hadeeth, namaz_type, hadeethid]);

        res.status(200).send("Hadeeth Updated Successfully");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


//delete api for Hadeeth
app.delete("/api/deleteHadeeth/:hadeethid" ,authenticate, async (req,res)=>{
    const {hadeethid} = req.params
    try{
        const deleteHadeethQuery = `delete from hadeeth where hadeeth_id = '${hadeethid}'`
        await pool.query(deleteHadeethQuery);

        res.status(200).send("Hadeeth Deleted Successfully");
    }catch (error){
        console.error(error);
        res.status(500).send("Internal Server Error")
    }
});

module.exports = app;
