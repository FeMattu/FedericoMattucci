import Education, { Studies, Course, Certification, Degree } from "../interfaces/Education";
import ParseDate from "./DateParser";
import ParseLocation from "./LocationParser";
import { cleanValue } from "../utils/utils";
import { TFunction } from "../../hooks/useTranslationsSafe";

export default function ParseEducation(rawEducation: Education, t: TFunction): Education {
    const parseStudies = (studies: Studies[]): Studies[] => {
        return studies.map(study => ({
            name: study.name,
            title: cleanValue(t, study.title, "education.studies.title"),
            institution: study.institution,
            description: study.description,
            location: ParseLocation(study.location, t),
            startDate: ParseDate(study.startDate, t),
            endDate: ParseDate(study.endDate, t)
        }));
    };

    const parseCourses = (courses: Course[]): Course[] => {
        return courses.map(course => ({
            name: course.name,
            description: course.description,
            institution: course.institution,
            location: ParseLocation(course.location, t),
            startDate: ParseDate(course.startDate, t),
            endDate: ParseDate(course.endDate, t)
        }));
    };

    const parseCertifications = (certifications: Certification[]): Certification[] => {
        return certifications.map(cert => ({
            title: cert.title,
            issueBy: cert.issueBy,
            description: cert.description,
            id: cert.id,
            url: cert.url,
            issueDate: ParseDate(cert.issueDate, t),
            expirationDate: ParseDate(cert.expirationDate, t),
            validity: cleanValue(t, cert.validity, "education.certification.validity"),
            valid: cert.valid
        }));
    };

    const parseDegrees = (degrees: Degree[]): Degree[] => {
        return degrees.map(degree => ({
            title: degree.title,
            type: cleanValue(t, degree.type, "education.degree.type"),
            institution: degree.institution,
            description: degree.description,
            grade: degree.grade,
            date: ParseDate(degree.date, t)
        }));
    };

    return {
        studies: rawEducation.studies ? parseStudies(rawEducation.studies) : [],
        courses: rawEducation.courses ? parseCourses(rawEducation.courses) : [],
        certifications: rawEducation.certifications ? parseCertifications(rawEducation.certifications) : [],
        degrees: rawEducation.degrees ? parseDegrees(rawEducation.degrees) : []
    };
}