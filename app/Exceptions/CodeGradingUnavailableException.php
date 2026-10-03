<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * A coding exercise could not be graded because Judge0 was unreachable.
 * Nothing was recorded; the student can submit again.
 */
class CodeGradingUnavailableException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct('Your code could not be graded right now. Please try submitting again in a moment.');
    }
}
