import { RoleModel} from '../models/RoleModel.js';
import { UserModel } from '../models/UserModel.js';

export const getsRole = async (req, res) =>{
    try {
        const roles = await RoleModel.find();
        if(!roles) return res.status(404).json({Success:false , Message:"Not found"});

        res.status(200).json({Success:true, Message:"Get roles successful" , Roles:roles});
    } catch (error) {
        res.status(500).json({Success:false, Message:"Error, please try again", Error:error});
    }
}

export const createRole = async (req,res)=>{
    try {
        const data = req.body;
        const role = new RoleModel(data);
        await role.save();
        res.status(200).json(role);
    } catch (error) {
    res.status(500).json({ error: error });
    }
}

export const updateRole = async (req,res) =>{
    const admin = req.user;
    // console.log("Admin:", admin);
    if(!admin.role === "System Management") return res.status(403).json({Success:false , Message:"You are not authorized to view the requested resource."});
    try {
        const role = await RoleModel.findById({_id:req.body.roleId});
        const userUpdate = await UserModel.findByIdAndUpdate({_id:req.body.userId},{role:role.roleName} ,{new:true});
        await userUpdate.save();

        res.status(200).json({Success:true, Message:"User role update successful"});
    } catch (error) {
        res.status(500).json({Success:false, Message:"Error, please try again", Error:error});
    }

}