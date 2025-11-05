# Brief Overview (prototype)

## Marksync is a location-based spoof-proof attendance system which i originally made to mark attendance for my class being a CR. The motivation was to ensure fair and transparent attendance system which would help me as well as students by giving them satisfaction of marking their own attendance.

# How it works
## The system works by checking the current coordinates of the device (in this case the student's device). It then calculates the distance with the pre-defined coordinates of the respective classrooms for a particular course. Then it checks whether the student is within a predefined radius of the classroom or not. Based on that the attendance is marked for a particular course in the allocated timeslot. 
### To use the system, you'll need to have a student account. The student account as of right now, can only be created by the admin. Hence, students must use their university provided emails for registration. The ability to self-register will be added in later iterations. After registration, the student will see offered courses, the choice of registering a particular course is unavailable right now because all the students study same majority of courses. The said feature will be added later. The students will mark their presence while in the designated classroom.

## Requirements for the system
### The system will require location to mark attendance. You must allow the Location Access in your client to be able to mark attendance. 

# How to run the project locally
## Node (npm) must be installed before running this project.
## Clone the repo, run 
```npm i``` 
## and let the packages be installed.
## run 
```npm run dev```
## to run the project locally.
## Configure your MongoDB env variable and Next-Auth Secret in .env.local. 
