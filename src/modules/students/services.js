const path = require("path");
const Utils = require(path.resolve("src/config/utils"));

// const stdModel = require("./Students");
// const clsModel = require("../classes/classes");
// const secModel = require("../sections/Sections");


const stdModel = require(path.resolve("src/modules/students/Students"));
const clsModel = require(path.resolve("src/modules/classes/classes"));
const secModel = require(path.resolve("src/modules/sections/Sections"));

const Sequelize = require("sequelize");
const op = Sequelize.Op;
const appConstants = require(path.resolve("appconstants"));

stdModel.belongsTo(clsModel, {
  thorugh: "classId",
  foreignKey: "classId",
});

stdModel.belongsTo(secModel, {
  thorugh: "sectionId",
  foreignKey: "sectionId",
});

const ClassAssoc = {
  model: clsModel,
  attributes: {
    exclude: ["classId", "status", "createdAt", "updatedAt"],
  },
};

const SectionAssoc = {
  model: secModel,
  attributes: {
    exclude: ["sectionId", "classId", "status", "createdAt", "updatedAt"],
  },
};

module.exports = {
  createNewStudents: async (reqObj) => {
    try {
      var setData = [];
      var students = reqObj.students;
      console.log("students:", students);
      let academicYear = await Utils.getAcademicYear();

      for (i = 0; i < students.length; i++) {
        if (students[i].hasOwnProperty("academicYear")) {
          academicYear = students[i].academicYear;
        }
        setData.push({
          studentFirstName: students[i].studentFirstName,
          studentLastName: students[i].studentLastName,
          academicYear: academicYear,
          DOB: students[i].dob,
          contactNumber: students[i].contactNumber,
          classId: reqObj.classId,
          sectionId: reqObj.sectionId,
          rollNumber: "0",
        });
      }

      const paramObj = {
        model: stdModel,
        data: setData,
        insertUpdate: "insert",
        updateOnDuplicateFields: [],
        fetchRowsCond: {
          classId: reqObj.classId,
          sectionId: reqObj.sectionId,
        },
        offset: 0,
        limit: 100,
        msg: "Insert Students",
        excludeFields: [
          "classId",
          "sectionId",
          "profileIPic",
          "rollNumber",
          "bloodGroup",
          "status",
          "createdAt",
          "updatedAt",
        ],
        feature: "students",
        includes: [ClassAssoc, SectionAssoc],
        orderBy: ["studentId", "DESC"],
      };

      // bulk update the sections
      const resultSet = await Utils.bulkInsertUpdate(paramObj);

      return resultSet
        ? await Utils.returnResult(
            "Students retrieval",
            resultSet.resultSet,
            null,
            resultSet.resultSet.length
          )
        : await Utils.returnResult("student/s insert", [], false);
    } catch (err) {
      console.log("syntax:", err);
      return await Utils.catchError("section creation", err);
    }
  },
  updateASection: async (reqObj) => {
    try {
      var allFields = await Utils.getTableColumns(stdModel);
      var setData = [];
      var students = reqObj.students;
      console.log("students:", students);
      var fieldsToUpdate = [];
      var includeFields = [];

      includeFields.push("studentId");
      includeFields.push("studentFirstName");
      includeFields.push("studentLastName");
      includeFields.push("classId");
      includeFields.push("sectionId");
      includeFields.push("academicYear");
      includeFields.push("contactNumber");
      includeFields.push("profilePic");
      includeFields.push("DOB");
      includeFields.push("bloodGroup");
      includeFields.push("rollNumber");
      includeFields.push("status");

      fieldsToUpdate.push("studentId");
      fieldsToUpdate.push("studentFirstName");
      fieldsToUpdate.push("studentLastName");
      fieldsToUpdate.push("classId");
      fieldsToUpdate.push("sectionId");
      fieldsToUpdate.push("academicYear");
      fieldsToUpdate.push("contactNumber");
      fieldsToUpdate.push("profilePic");
      fieldsToUpdate.push("DOB");
      fieldsToUpdate.push("bloodGroup");
      fieldsToUpdate.push("rollNumber");
      fieldsToUpdate.push("status");

      var errors = [];
      for (i = 0; i < students.length; i++) {
        //get the student obj by primaryKey
        var student = await stdModel.findByPk(students[i].studentId);
        if (!student) {
          errors.push({
            studentId:
              "Student Id (" + students[i].studentId + " does not exists)",
          });
        } else {
          if (students[i].hasOwnProperty("rollNumber")) {
            const cond = {
              classId: reqObj.classId,
              sectionId: reqObj.sectionId,
              rollNumber: students[i].rollNumber,
              studentId: {
                [op.not]: students[i].studentId,
              },
            };
            if (
              (await Utils.checkRowExists(
                cond,
                stdModel,
                "Check rollnumber exists"
              )) > 0
            ) {
              errors.push({
                studentId:
                  "Cannot allowed duplicate roll number (" +
                  students[i].rollNumber +
                  ")",
              });
            }
          }
        }

        if (student) {
          var updateStudent = {
            studentId: student.studentId,
            studentFirstName: student.studentFirstName,
            studentLastName: student.studentLastName,
            classId: student.classId,
            sectionId: student.sectionId,
            academicYear: student.academicYear,
            contactNumber: student.contactNumber,
            profilePic: student.profilePic,
            DOB: student.DOB,
            bloodGroup: student.bloodGroup,
            rollNumber: student.rollNumber,
            status: student.status,
          };

          if (students[i].hasOwnProperty("studentFirstName")) {
            updateStudent.studentFirstName = students[i].studentFirstName;
          }
          if (students[i].hasOwnProperty("studentLastName")) {
            updateStudent.studentLastName = students[i].studentLastName;
          }
          if (students[i].hasOwnProperty("dob")) {
            updateStudent.DOB = students[i].dob;
          }
          if (students[i].hasOwnProperty("profilePic")) {
            updateStudent.profilePic = students[i].profilePic;
          }
          if (students[i].hasOwnProperty("bloodGroup")) {
            updateStudent.bloodGroup = students[i].bloodGroup;
          }
          if (students[i].hasOwnProperty("rollNumber")) {
            updateStudent.rollNumber = students[i].rollNumber;
          }

          if (students[i].hasOwnProperty("status")) {
            updateStudent.status = students[i].status;
          }

          if (students[i].hasOwnProperty("academicYear")) {
            updateStudent.academicYear = students[i].academicYear;
          }

          if (students[i].hasOwnProperty("contactNumber")) {
            updateStudent.contactNumber = students[i].contactNumber;
          }
          setData.push(updateStudent);
        }
      }
      if (errors.length > 0) {
        return await Utils.returnResult("Students Update", {
          ValidationErrors: errors,
        });
      }
      var excludeFields = await Utils.getElementsInArrays(
        allFields,
        includeFields,
        -1
      );

      const paramObj = {
        model: stdModel,
        data: setData,
        insertUpdate: "update",
        updateOnDuplicateFields: fieldsToUpdate,
        fetchRowsCond: {
          classId: reqObj.classId,
          sectionId: reqObj.sectionId,
        },
        offset: 0,
        limit: 100,
        msg: "Update Student/s",
        excludeFields: excludeFields,
        feature: "students",
        includes: [ClassAssoc, SectionAssoc],
        orderBy: ["studentId", "DESC"],
      };

      // bulk update the sections
      const resp = await Utils.bulkInsertUpdate(paramObj);

      return resp
        ? await Utils.returnResult(
            "Students retrieval",
            resp.resultSet,
            null,
            resp.resultSet.length
          )
        : await Utils.returnResult("student/s insert", [], false);
    } catch (err) {
      console.log("syntax:", err);
      return await Utils.catchError("section creation", err);
    }
  },
  getStudents: async (reqObj) => {
    const academicYear = await Utils.getAcademicYear();

    var cond = {
      academicYear: academicYear,
      classId: reqObj.classId,
    };
    if (reqObj.hasOwnProperty("sectionId")) {
      cond.sectionId = reqObj.sectionId;
    }
    const totalResults = await Utils.getTotalRows(
      cond,
      stdModel,
      "GetTotalRows of a class" + reqObj.classId
    );

    var offSet = await Utils.checkOffSetLimit(
      "getStudents",
      reqObj.offset,
      reqObj.limit,
      totalResults
    );
    if (typeof offSet != "number") {
      return await Utils.returnResult("students", false, offSet[0], null);
    }
    const excludeFields = [
      "createdAt",
      "updatedAt",
    ];

    const includes = [ClassAssoc, SectionAssoc];
    const orderBy = ["studentId", "DESC"];
    const msg = "get rows of a class" + reqObj.classId;
    const limit = reqObj.limit;

    const fetchObjParams = {
      model: stdModel,
      fetchRowsCond: cond,
      offSet,
      limit,
      msg,
      excludeFields,
      includes,
      orderBy,
    };

    const students = await Utils.fetchRows(fetchObjParams);
    if (students) {
      delete students.success;
      delete students.message;
      
      //get the total
      return await Utils.returnResult(
        "students",
        students,
        null,
        totalResults
      );
    } else {
      return await Utils.returnResult("students", false, "No records found");
    }
  },
  uploadProfilePic: async (reqObj) => {
    //check whether the student exists or not
    var cond = {
      studentId: reqObj.body.studentId,
    };
    const studentExists = await Utils.getTotalRows(
      cond,
      stdModel,
      "check whether student exists or not" + reqObj.body.studentId
    );
    if (studentExists == 0) {
      return await Utils.returnResult("students", false, "No Student exists!");
    }
    try {
      sampleFile = reqObj.files.ProfilePic;

      var errors = [];
      if (sampleFile.size > 2000000) {
        errors.push({ "File Size": "Allowed till 2MB" });
      }
      const allowedType = await Utils.imageFilter(sampleFile.mimetype);
      if (!allowedType) {
        errors.push({ "File Size": "Only jpeg or png file Type allowed" });
      }

      if (errors.length > 0) {
        return await Utils.returnResult("ProfilePic Upload", {
          ValidationErrors: errors,
        });
      }

      var fileName = Date.now() + path.extname(sampleFile.name);
      uploadPath = appConstants.UPLOADPATH + "studentProfilePics/" + fileName;

      // Use the mv() method to place the file somewhere on your server
      sampleFile.mv(uploadPath, async function (err) {
        if (err) {
          await Utils.logToWinston("Failed to Upload:", err);
          return await Utils.returnResult(
            "students",
            err,
            null,
            "Failed to upload"
          );
        }
      });

      var prevProfilePic = await Utils.getAField(
        cond,
        "profilePic",
        stdModel,
        "students",
        [
          "studentId",
          "studentFirstName",
          "studentLastName",
          "classId",
          "sectionId",
          "DOB",
          "bloodGroup",
          "rollNumber",
          "status",
          "createdAt",
          "updatedAt",
        ]
      );

      //remove the previous profilePic added to the student
      await stdModel.update(
        { profilePic: uploadPath },
        {
          where: {
            studentId: reqObj.body.studentId,
          },
        }
      );

      if (prevProfilePic.profilePic != "") {
        Utils.unlinkAFile(prevProfilePic.profilePic);
      }

      const excludeFields = ["DOB", "bloodGroup", "createdAt", "updatedAt"];
      const student = await Utils.fetchRows(
        stdModel,
        cond,
        0,
        1,
        "get student info" + reqObj.studentId,
        excludeFields,
        (includes = [ClassAssoc, SectionAssoc]),
        ["studentId", "DESC"]
      );

      return await Utils.returnResult("students", student.resultSet, null, 1);
    } catch (excep) {
      await Utils.logToWinston("Unable to remove prev uploaded file", excep);
      return await Utils.returnResult("students", false, "Failed to upload");
    }
  },
  prepareParams: async (req, classModel, cond) => {
    const schoolId = req.user.schoolId;

    req.offset = 0;
    req.limit = 10;

    if (req.query.page) {
      req.offset = req.query.page;
      if (req.query.hasOwnProperty("limit")) {
        req.limit = req.query.limit;
      }
    }
    if (req.query.classId) {
      req.classId = req.query.classId;
    } else {
      const executedFileds = [
        "className",
        "schoolId",
        "status",
        "createdAt",
        "updatedAt",
      ];
      const classResp = await Utils.getAField(
        {schoolId: schoolId},
        "classId",
        classModel,
        "classes",
        executedFileds
      );
      req.classId = classResp.classId;
      console.log("classId is:", req.classId);
    }
    if (req.query.sectionId) {
      req.sectionId = req.query.sectionId;
    }
    return req;
  },
};
