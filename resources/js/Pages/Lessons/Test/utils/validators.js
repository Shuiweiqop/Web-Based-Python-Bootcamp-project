/**
 * Test Answer Validation Utilities
 */

// Validation error messages
export const VALIDATION_MESSAGES = {
    REQUIRED: 'This field is required.',
    MCQ_NO_SELECTION: 'Please select an answer.',
    MCQ_MULTI_MIN_NOT_MET: (min) => `Please select at least ${min} option(s).`,
    MCQ_MULTI_MAX_EXCEEDED: (max) => `Please select no more than ${max} option(s).`,
    SHORT_ANSWER_TOO_SHORT: (min) => `Answer must be at least ${min} characters long.`,
    SHORT_ANSWER_TOO_LONG: (max) => `Answer must be no more than ${max} characters long.`,
    CODE_EMPTY: 'Please provide your code solution.',
    CODE_TOO_SHORT: (min) => `Code must be at least ${min} characters long.`,
    TRUE_FALSE_NO_SELECTION: 'Please select True or False.',
    INVALID_FORMAT: 'Invalid answer format.'
};

/**
 * Validate MCQ Single Choice answer
 */
export const validateMcqSingle = (answer, options = {}) => {
    const errors = [];
    
    if (!answer || !answer.selected) {
        errors.push(VALIDATION_MESSAGES.MCQ_NO_SELECTION);
        return { isValid: false, errors };
    }

    // Check if selected option exists in available options
    if (options.availableOptions && !options.availableOptions.hasOwnProperty(answer.selected)) {
        errors.push(VALIDATION_MESSAGES.INVALID_FORMAT);
        return { isValid: false, errors };
    }

    return { isValid: true, errors: [] };
};

/**
 * Validate MCQ Multiple Choice answer
 */
export const validateMcqMulti = (answer, options = {}) => {
    const errors = [];
    const { minSelections = 1, maxSelections = null } = options;
    
    if (!answer || !Array.isArray(answer.selected)) {
        errors.push(VALIDATION_MESSAGES.INVALID_FORMAT);
        return { isValid: false, errors };
    }

    const selectedCount = answer.selected.length;

    if (selectedCount < minSelections) {
        errors.push(VALIDATION_MESSAGES.MCQ_MULTI_MIN_NOT_MET(minSelections));
    }

    if (maxSelections && selectedCount > maxSelections) {
        errors.push(VALIDATION_MESSAGES.MCQ_MULTI_MAX_EXCEEDED(maxSelections));
    }

    // Validate that all selected options exist
    if (options.availableOptions) {
        const invalidSelections = answer.selected.filter(
            selection => !options.availableOptions.hasOwnProperty(selection)
        );
        if (invalidSelections.length > 0) {
            errors.push(VALIDATION_MESSAGES.INVALID_FORMAT);
        }
    }

    return { isValid: errors.length === 0, errors };
};

/**
 * Validate Short Answer
 */
export const validateShortAnswer = (answer, options = {}) => {
    const errors = [];
    const { minLength = 1, maxLength = 500, required = true } = options;
    
    if (!answer || typeof answer.text !== 'string') {
        if (required) {
            errors.push(VALIDATION_MESSAGES.REQUIRED);
        }
        return { isValid: !required, errors };
    }

    const text = answer.text.trim();
    
    if (required && text.length === 0) {
        errors.push(VALIDATION_MESSAGES.REQUIRED);
    }

    if (text.length > 0) {
        if (text.length < minLength) {
            errors.push(VALIDATION_MESSAGES.SHORT_ANSWER_TOO_SHORT(minLength));
        }

        if (text.length > maxLength) {
            errors.push(VALIDATION_MESSAGES.SHORT_ANSWER_TOO_LONG(maxLength));
        }
    }

    return { isValid: errors.length === 0, errors };
};

/**
 * Validate Code Answer
 */
export const validateCodeAnswer = (answer, options = {}) => {
    const errors = [];
    const { minLength = 10, required = true } = options;
    
    if (!answer || typeof answer.code !== 'string') {
        if (required) {
            errors.push(VALIDATION_MESSAGES.CODE_EMPTY);
        }
        return { isValid: !required, errors };
    }

    const code = answer.code.trim();
    
    if (required && code.length === 0) {
        errors.push(VALIDATION_MESSAGES.CODE_EMPTY);
    }

    if (code.length > 0 && code.length < minLength) {
        errors.push(VALIDATION_MESSAGES.CODE_TOO_SHORT(minLength));
    }

    // Basic Python syntax checks (optional)
    if (options.language === 'python' && code.length > 0) {
        const pythonErrors = validatePythonSyntax(code);
        errors.push(...pythonErrors);
    }

    return { isValid: errors.length === 0, errors };
};

/**
 * Validate True/False Answer
 */
export const validateTrueFalse = (answer, options = {}) => {
    const errors = [];
    
    if (!answer || !answer.answer) {
        errors.push(VALIDATION_MESSAGES.TRUE_FALSE_NO_SELECTION);
        return { isValid: false, errors };
    }

    const validValues = ['True', 'False', 'true', 'false'];
    if (!validValues.includes(answer.answer)) {
        errors.push(VALIDATION_MESSAGES.INVALID_FORMAT);
    }

    return { isValid: errors.length === 0, errors };
};

/**
 * Basic Python syntax validation
 */
const validatePythonSyntax = (code) => {
    const errors = [];
    
    // Check for basic Python issues
    const lines = code.split('\n');
    
    // Check for consistent indentation (basic check)
    let hasIndentationIssue = false;
    let prevIndentLevel = 0;
    
    lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        if (trimmedLine.length === 0 || trimmedLine.startsWith('#')) return;
        
        const leadingSpaces = line.length - line.trimLeft().length;
        const indentLevel = leadingSpaces / 4;
        
        // Check if indentation uses tabs (discouraged in Python)
        if (line.includes('\t')) {
            errors.push('Consider using spaces instead of tabs for indentation.');
            hasIndentationIssue = true;
        }
        
        // Check for extreme indentation jumps
        if (Math.abs(indentLevel - prevIndentLevel) > 2) {
            hasIndentationIssue = true;
        }
        
        prevIndentLevel = indentLevel;
    });
    
    if (hasIndentationIssue) {
        errors.push('Check your code indentation. Python requires consistent indentation.');
    }
    
    // Check for missing colons after control structures
    const controlStructures = /^(\s*)(if|elif|else|for|while|def|class|try|except|finally|with)\b/;
    lines.forEach((line) => {
        const trimmedLine = line.trim();
        if (controlStructures.test(line) && !trimmedLine.endsWith(':')) {
            errors.push('Missing colon (:) after control structure.');
        }
    });
    
    return errors;
};

/**
 * Main validation function that routes to appropriate validator
 */
export const validateAnswer = (testType, answer, options = {}) => {
    switch (testType) {
        case 'mcq':
            return options.multiSelect 
                ? validateMcqMulti(answer, options)
                : validateMcqSingle(answer, options);
                
        case 'short_answer':
            return validateShortAnswer(answer, options);
            
        case 'coding':
            return validateCodeAnswer(answer, options);
            
        case 'true_false':
            return validateTrueFalse(answer, options);
            
        default:
            return { 
                isValid: false, 
                errors: ['Unknown question type'] 
            };
    }
};

/**
 * Validate multiple answers at once
 */
export const validateAnswers = (questions, answers) => {
    const results = {};
    let overallValid = true;
    
    questions.forEach((question) => {
        const answer = answers[question.id];
        const validation = validateAnswer(question.type, answer, question.validationOptions);
        
        results[question.id] = validation;
        if (!validation.isValid) {
            overallValid = false;
        }
    });
    
    return {
        isValid: overallValid,
        results
    };
};

/**
 * Get validation options based on test configuration
 */
export const getValidationOptions = (test) => {
    const options = {
        required: true
    };
    
    switch (test.type) {
        case 'mcq':
            options.availableOptions = test.options;
            options.multiSelect = test.multi_select || false;
            if (options.multiSelect) {
                options.minSelections = test.min_selections || 1;
                options.maxSelections = test.max_selections || null;
            }
            break;
            
        case 'short_answer':
            options.minLength = test.min_length || 1;
            options.maxLength = test.max_length || 500;
            break;
            
        case 'coding':
            options.minLength = test.min_length || 10;
            options.language = test.language || 'python';
            break;
            
        case 'true_false':
            // No additional options needed
            break;
    }
    
    return options;
};