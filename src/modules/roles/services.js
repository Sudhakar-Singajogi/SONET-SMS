const path = require("path");
const Utils = require(path.resolve("src/config/utils"));
const roleModel = require(path.resolve("src/modules/roles/Role"));
const usersModel =  require(path.resolve("src/modules/users/User"));

usersModel.belongsTo(roleModel, {
    foreignKey: "roleId",
  });

  const UserAssoc = {
    model: usersModel,
    attributes: {
      exclude: ["password", "createdAt", "updatedAt"],
    },
  };

  var self = (module.exports = {
    getRolesWithAccounts: async (newClass) => {
        const [results, metadata] = await sequelize.query( "SELECT count(users.roleId) as accounts, roles.roleName, roles.roleId FROM `users` join roles on roles.roleId=users.roleId and roles.status=1 GROUP by users.roleId" );
        return  results;
         
      },
      getUserRolesWithAccess: async (roleName) => {
        console.log('roleName is', roleName)
        const cond = (roleName !== 'all') ? `where r.roleName='${roleName}' and r.status=1` : `where r.status=1`;

        const [results, metadata] = await sequelize.query(`SELECT u.userId, u.userName, u.status userStatus, u.email, r.roleName, r.roleId, r.status, per.name permissionName from users as u 
        join roles as r on r.roleId=u.roleId join assigned_permissionto_roles as apr on apr.roleId=r.roleId join permissions as per 
        on per.permissionId=apr.permissionId ${cond}`);

        if(results.length >0) {
            const data = [];
            
            results.map((item) => {
                var access = ''
                if(data.length == 0 ) {
                    if(item.permissionName === "CRUD") {
                        access = 'Full Access';
                    } else {
                        access = 'Limited Access';
                    }

                    data.push({
                        "user":{
                            "id":item.userId,
                            "userName":item.userName,
                            "email":item.email,
                            'status':item.userStatus
                        },
                        "role":{
                            'roleId':item.roleId,
                            "roleName":item.roleName
                        },
                        "permissionName":item.permissionName,
                        "access":access
                    });
                } else { 
                    console.log('length is', data.length)
                    const foundElement = data.findIndex(dataItem =>  dataItem.user.id === item.userId );
                    console.log(foundElement);

                    if(foundElement >=0 ) {
                        if(item.permissionName === "CRUD") {
                            access = 'Full Access';
                        } else {
                            access = 'Limited Access';
                        }

                        if( item.permissionName !== data[foundElement].permissionName) {
                            data[foundElement].access = access;
                        }

                    } else {
                        if(item.permissionName === "CRUD") {
                            access = 'Full Access';
                        } else {
                            access = 'Limited Access';
                        }

                        data.push({
                            "user":{
                                "id":item.userId,
                                "userName":item.userName,
                                "email":item.email,
                                'status':item.userStatus
                            },
                            "role":{
                                'roleId':item.roleId,
                                "roleName":item.roleName
                            },
                            "permissionName":item.permissionName,
                            "access":access
                        }); 
                    }
                }
            })
            return data;
        }
         return [];
      },
  });
