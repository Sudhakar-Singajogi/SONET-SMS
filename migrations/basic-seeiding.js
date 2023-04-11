"use strict";
const sequelize = require("../src/dbconn/connection");

const insertUser =
  "INSERT INTO `users` (`userId`, `userName`, `email`, `password`, `roleId`, `schoolId`, `status`, `createdAt`, `updatedAt`) VALUES (1, 'Arun', 'latha.mohan@mailinator', 'e10adc3949ba59abbe56e057f20f883e', 1, 1, '1', '2021-08-07 13:08:01', '2021-08-07 13:08:01')";

const insert_assigned_permissionto_roles =
  "INSERT INTO `assigned_permissionto_roles` (`assignedId`, `roleId`, `permissionId`, `createdAt`, `updatedAt`) VALUES (1, 1, 1, NULL, '2021-08-07 18:48:18'), (2, 1, 2, NULL, '2021-08-07 18:48:18'), (3, 1, 3, NULL, '2021-08-07 18:48:18'), (4, 1, 4, '2021-08-14 10:58:29', '2021-08-14 18:48:18'), (5, 1, 5, '2021-08-14 10:58:29', '2021-08-14 18:48:18'), (6, 1, 6, '2021-08-14 10:58:29', '2021-08-14 18:48:18'), (7, 1, 7, '2021-08-14 10:58:29', '2021-08-14 18:48:18'), (8, 1, 8, '2021-08-14 10:58:29', '2021-08-14 18:48:18');";

const insert_assigned_subjects_classes =
  "INSERT INTO `assigned_subjects_classes` (`assignedId`, `subjectId`, `classId`, `schoolId`, `status`, `createdAt`, `updatedAt`) VALUES (1, '1', 1, 1, '1', '2021-09-04 09:02:11', '2021-09-04 09:02:11'), (2, '1', 2, 1, '1', '2021-09-04 09:02:11', '2021-09-04 09:02:11'), (3, '2', 1, 1, '1', '2021-09-04 09:02:11', '2021-09-04 09:02:11'), (4, '2', 2, 1, '1', '2021-09-04 09:02:11', '2021-09-04 09:02:11'), (5, '3', 1, 1, '1', '2021-09-04 09:02:11', '2021-09-04 09:02:11'), (6, '3', 2, 1, '1', '2021-09-04 09:02:11', '2021-09-04 09:02:11'), (11, '1', 3, 1, '1', '2021-09-04 10:57:46', '2021-09-04 10:57:46'), (12, '3', 3, 1, '1', '2021-09-04 10:57:46', '2021-09-04 10:57:46');";

const insert_classes =
  "INSERT INTO `classes` (`classId`, `className`, `schoolId`, `status`, `createdAt`, `updatedAt`) VALUES (1, 'class-I', 1, '1', '2021-08-08 11:32:36', '2021-08-08 11:32:36'), (2, 'class-II', 1, '1', '2021-08-08 11:33:51', '2021-08-08 11:33:51'), (3, 'class-III', 1, '1', '2021-08-08 11:35:55', '2021-08-08 11:35:55'), (4, 'class-IV', 1, '1', '2021-08-08 11:38:07', '2021-08-08 11:38:07'), (5, 'class-V', 1, '1', '2021-08-08 11:39:52', '2021-08-08 11:39:52'), (6, 'class-VI', 1, '1', '2021-08-08 11:41:08', '2021-08-08 11:41:08'), (8, 'class-VII', 1, '1', '2021-08-08 11:42:25', '2021-08-08 11:42:25'), (9, 'class-VIII', 1, '1', '2021-08-08 11:44:32', '2021-08-08 11:44:32'), (10, 'class-IX', 1, '1', '2021-08-08 11:45:00', '2021-08-08 11:45:00'), (14, 'class-X', 1, '1', '2021-08-11 05:59:45', '2021-08-16 07:20:41'), (15, 'class-XI', 1, '1', '2021-08-16 07:20:57', '2021-08-16 07:20:57'), (17, 'class-XII', 1, '1', '2021-08-16 07:26:38', '2021-08-16 07:26:38');";

const inser_permissions =
  "INSERT INTO `permissions` (`permissionId`, `name`, `moduleId`, `read`, `write`, `delete`, `createdAt`, `updatedAt`) VALUES (1, 'CRUD', 1, '1', '1', '1', NULL, NULL), (2, 'CRUD', 2, '1', '1', '1', NULL, NULL), (3, 'CRUD', 3, '1', '1', '1', NULL, NULL), (4, 'CRUD', 4, '1', '1', '1', '2021-08-14 10:56:19', '2021-08-14 10:56:19'), (5, 'CRUD', 5, '1', '1', '1', '2021-08-14 10:56:19', '2021-08-14 10:56:19'), (6, 'CRUD', 6, '1', '1', '1', '2021-08-14 10:56:19', '2021-08-14 10:56:19'), (7, 'CRUD', 7, '1', '1', '1', '2021-08-14 10:56:19', '2021-08-14 10:56:19'), (8, 'CRUD', 8, '1', '1', '1', '2021-08-14 10:56:19', '2021-08-14 10:56:19');";

const insert_roles =
  "INSERT INTO `roles` (`roleId`, `roleName`, `status`, `createdAt`, `updatedAt`) VALUES (1, 'SuperAdmin', '1', '2021-08-25 11:43:47', NULL);";

const insert_schools =
  "INSERT INTO `schools` (`schoolId`, `schoolName`, `identity`, `email`, `primaryContactPerson`, `contactNumber`, `status`, `createdAt`, `updatedAt`) VALUES (1, 'Gandhi High  School', 'GHS', 'latha.mohan@mailinator', 'Arun', '8498081695', '1', '2021-08-07 13:08:01', '2021-08-07 13:08:01');";

const insert_sections =
  "INSERT INTO `sections` (`sectionId`, `sectionName`, `classId`, `status`, `createdAt`, `updatedAt`) VALUES (1, 'Section-A', 1, '1', '2021-08-14 05:29:49', '2021-08-14 08:47:16'), (2, 'Section-B', 1, '1', '2021-08-14 05:30:47', '2021-08-14 05:30:47'), (3, 'Section-C', 1, '1', '2021-08-14 05:30:52', '2021-08-14 05:30:52'), (4, 'Section-D', 1, '1', '2021-08-14 05:30:55', '2021-08-14 05:30:55'), (5, 'Section-D', 2, '1', '2021-08-14 05:31:00', '2021-08-14 05:31:00'), (6, 'Section-c', 2, '1', '2021-08-14 05:31:03', '2021-08-14 05:31:03'), (7, 'Section-B', 2, '1', '2021-08-14 05:31:09', '2021-08-14 05:31:09'), (8, 'Section-A', 2, '1', '2021-08-14 05:31:12', '2021-08-14 05:31:12'), (9, 'Section-A', 3, '1', '2021-08-14 05:31:25', '2021-08-14 05:31:25'), (10, 'Section-B', 3, '1', '2021-08-14 05:31:28', '2021-08-14 05:31:28'), (11, 'Section-C', 3, '1', '2021-08-14 05:31:32', '2021-08-14 05:31:32'), (12, 'Section-D', 3, '1', '2021-08-14 05:31:35', '2021-08-14 05:31:35'), (13, 'Section-E', 3, '1', '2021-08-14 05:31:38', '2021-08-14 05:31:38')";

const insert_students =
  "INSERT INTO `students` (`studentId`, `studentFirstName`, `studentLastName`, `classId`, `sectionId`, `academicYear`, `contactNumber`, `profilePic`, `DOB`, `bloodGroup`, `rollNumber`, `status`, `createdAt`, `updatedAt`) VALUES (1, 'Rudranash', 'Singajogi', 1, 1, '2021-2022', '0', 'E:\\sonet-school/uploads/studentProfilePics/1630149735712.png', '2018-01-01', NULL, 'GHS-0001', '1', '2021-08-21 11:08:05', '2021-08-28 11:22:15'), (2, 'Rushank', 'Singajogi', 1, 1, '2021-2022', '0', NULL, '2016-09-05', NULL, 'GHS-0002', '1', '2021-08-21 11:08:05', '2021-08-21 11:08:05'), (3, 'Pranay Krishna', 'Singajogi', 1, 1, '2021-2022', '0', NULL, '2018-01-01', NULL, '0', '1', '2021-08-21 11:21:32', '2021-08-21 11:21:32'), (4, 'Krishi vardhan', 'Singajogi', 1, 1, '2021-2022', '0', NULL, '2016-09-05', NULL, '0', '1', '2021-08-21 11:21:32', '2021-08-21 11:21:32'), (5, 'Javeed pasha', 'ms', 1, 2, '2021-2022', '0', NULL, '2018-01-01', NULL, '0', '1', '2021-08-21 11:28:05', '2021-08-21 11:28:05'), (6, 'Faheem ', 'Kh', 1, 2, '2021-2022', '0', NULL, '2016-09-05', NULL, '0', '1', '2021-08-21 11:28:05', '2021-08-21 11:28:05'), (7, 'Javeed', 'md', 1, 2, '2021-2022', '0', NULL, '2018-01-01', NULL, '0', '1', '2021-08-21 11:28:05', '2021-08-21 11:28:05'), (8, 'Raheem ', 'md', 1, 2, '2021-2022', '0', NULL, '2016-09-05', NULL, '0', '1', '2021-08-21 11:28:05', '2021-08-21 11:28:05'), (9, 'Javeed pasha', 'ms', 2, 1, '2021-2022', '0', NULL, '2018-01-01', NULL, '0', '1', '2021-08-21 11:29:43', '2021-08-21 11:29:43'), (10, 'Faheem ', 'Kh', 2, 1, '2021-2022', '0', NULL, '2016-09-05', NULL, '0', '1', '2021-08-21 11:29:43', '2021-08-21 11:29:43'), (11, 'Javeed', 'md', 2, 1, '2021-2022', '0', NULL, '2018-01-01', NULL, '0', '1', '2021-08-21 11:29:43', '2021-08-21 11:29:43'), (12, 'Raheem ', 'md', 2, 1, '2021-2022', '0', NULL, '2016-09-05', NULL, '0', '1', '2021-08-21 11:29:43', '2021-08-21 11:29:43'), (13, 'Javeed pasha3', 'ms', 3, 1, '2021-2022', '0', NULL, '2018-01-01', NULL, '0', '1', '2021-08-21 11:32:21', '2021-08-21 11:32:21'), (14, 'Faheem 3', 'Kh', 3, 1, '2021-2022', '0', NULL, '2016-09-05', NULL, '0', '1', '2021-08-21 11:32:21', '2021-08-21 11:32:21'), (15, 'Javeed 3', 'md', 3, 1, '2021-2022', '0', NULL, '2018-01-01', NULL, '0', '1', '2021-08-21 11:32:21', '2021-08-21 11:32:21'), (16, 'Raheem 3', 'md', 3, 1, '2021-2022', '0', NULL, '2016-09-05', NULL, '0', '1', '2021-08-21 11:32:21', '2021-08-21 11:32:21')";

const insert_subjects =
  "INSERT INTO `subjects` (`subjectId`, `subjectName`, `schoolId`, `status`, `createdAt`, `updatedAt`) VALUES (1, 'English', 1, '1', '2021-09-04 09:02:11', '2021-09-04 09:02:11'), (2, 'Hindi', 1, '1', '2021-09-04 09:02:11', '2021-09-04 09:02:11'), (3, 'Telugu', 1, '1', '2021-09-04 09:02:11', '2021-09-04 09:02:11');";

var basicInserts =
  insertUser +
  ";" +
  insert_assigned_permissionto_roles +
  ";" +
  insert_assigned_subjects_classes +
  ";" +
  insert_classes +
  ";";
basicInserts +=
  basicInserts +
  inser_permissions +
  ";" +
  insert_roles +
  ";" +
  insert_schools +
  ";" +
  insert_sections +
  ";" +
  insert_students +
  ";" +
  insert_subjects;

console.log("basicInserts" + basicInserts);

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(insert_roles);

    await queryInterface.sequelize.query(insert_schools);
    await queryInterface.sequelize.query(insertUser);
    await queryInterface.sequelize.query(inser_permissions);
    await queryInterface.sequelize.query(insert_classes);
    await queryInterface.sequelize.query(insert_sections);
    await queryInterface.sequelize.query(insert_students);
    await queryInterface.sequelize.query(insert_subjects);
    await queryInterface.sequelize.query(insert_assigned_permissionto_roles);
    await queryInterface.sequelize.query(insert_assigned_subjects_classes);
    // await queryInterface.sequelize.query(insert_roles, {type: queryInterface.sequelize.queryTypes.INSERT });

    // await queryInterface.sequelize.query(insert_schools, {type: queryInterface.sequelize.queryTypes.INSERT });
    // await queryInterface.sequelize.query(insertUser, {type: queryInterface.sequelize.queryTypes.INSERT });
    // await queryInterface.sequelize.query(inser_permissions, {type: queryInterface.sequelize.queryTypes.INSERT });
    // await queryInterface.sequelize.query(insert_classes, {type: queryInterface.sequelize.queryTypes.INSERT });
    // await queryInterface.sequelize.query(insert_sections, {type: queryInterface.sequelize.queryTypes.INSERT });
    // await queryInterface.sequelize.query(insert_students, {type: queryInterface.sequelize.queryTypes.INSERT });
    // await queryInterface.sequelize.query(insert_subjects, {type: queryInterface.sequelize.queryTypes.INSERT });
    // await queryInterface.sequelize.query(insert_assigned_permissionto_roles, {type: queryInterface.sequelize.queryTypes.INSERT });
    // await queryInterface.sequelize.query(insert_assigned_subjects_classes, {type: queryInterface.sequelize.queryTypes.INSERT });
  },
};
