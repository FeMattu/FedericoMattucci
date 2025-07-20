import Education, { Studies, Course, Certification, Degree } from "../interfaces/Education";
import ParseDate from "./DateParser";
import ParseLocation from "./LocationParser";
import { cleanValue } from "../utils";

export default function ParseEducation(rawEducation: any, locale: string): Education {
    const parseStudies = (studies: any[]): Studies[] => {
        return studies.map(study => ({
            name: study.name,
            title: cleanValue(study.title, "education"),
            institution: study.istitution || study.institution,
            description: study.description,
            location: ParseLocation(study.location, locale),
            startDate: ParseDate(study.startDate, locale),
            endDate: ParseDate(study.endDate, locale)
        }));
    };

    const parseCourses = (courses: any[]): Course[] => {
        return courses.map(course => ({
            name: course.name,
            description: course.description,
            institution: course.institution,
            location: ParseLocation(course.location, locale),
            startDate: ParseDate(course.startDate, locale),
            endDate: ParseDate(course.endDate, locale)
        }));
    };

    const parseCertifications = (certifications: any[]): Certification[] => {
        return certifications.map(cert => ({
            title: cert.title,
            issueBy: cert.issueBy,
            description: cert.description,
            id: cert.id,
            url: cert.url,
            issueDate: ParseDate(cert.issueDate, locale),
            expirationDate: ParseDate(cert.expirationDate, locale),
            validity: cert.validity,
            valid: cert.valid
        }));
    };

    const parseDegrees = (degrees: any[]): Degree[] => {
        return degrees.map(degree => ({
            title: degree.title,
            type: degree.type,
            institution: degree.institution,
            description: degree.description,
            grade: degree.grade,
            date: ParseDate(degree.date, locale)
        }));
    };

    return {
        studies: rawEducation.studies ? parseStudies(rawEducation.studies) : [],
        courses: rawEducation.courses ? parseCourses(rawEducation.courses) : [],
        certifications: rawEducation.certifications ? parseCertifications(rawEducation.certifications) : [],
        degrees: rawEducation.degrees ? parseDegrees(rawEducation.degrees) : []
    };
}